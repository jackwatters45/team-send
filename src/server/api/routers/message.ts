import { z } from "zod";
import debug from "debug";
import nodemailer from "nodemailer";
import type {
  EmailConfig,
  GroupMeConfig,
  Message,
  Reminder,
  SmsConfig,
} from "@prisma/client";
import Client from "twilio";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { useRateLimit } from "@/server/helpers/rateLimit";
import { handleError } from "@/server/helpers/handleError";
import { env } from "@/env";
import { messageInputSchema } from "@/schemas/messageSchema";
import type { MemberSnapshotWithContact } from "./member";

const log = debug("team-send:api:message");

type MessageWithContacts = Message & {
  recipients: MemberSnapshotWithContact[];
  reminders: Reminder[];
};

export const messageRouter = createTRPCRouter({
  getMessageById: protectedProcedure
    .input(z.object({ messageId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        await useRateLimit(userId);

        const message = await ctx.db.message.findUnique({
          where: { id: input.messageId, createdById: userId },
          include: {
            sentBy: true,
            recipients: { include: { member: { include: { contact: true } } } },
            reminders: true,
          },
        });

        if (!message) return throwMessageNotFoundError(input.messageId);

        return message;
      } catch (err) {
        throw handleError(err);
      }
    }),
  update: protectedProcedure
    .input(messageInputSchema)
    .mutation(
      async ({
        ctx,
        input: { reminders: _, saveRecipientState, recipients, ...data },
      }) => {
        if (!data.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Message ID is required",
          });
        }

        const userId = ctx.session.user.id;

        try {
          await useRateLimit(userId);

          const existingMessage = await ctx.db.message.findUnique({
            where: { id: data.id },
            include: {
              reminders: { select: { id: true, num: true, period: true } },
              recipients: true,
            },
          });

          if (!existingMessage) return throwMessageNotFoundError(data.id);

          if (existingMessage?.status === "sent") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Cannot edit a sent message",
            });
          }

          const result = await ctx.db.$transaction(async (prisma) => {
            // update group member snapshot
            await Promise.all(
              Object.entries(recipients).map(
                async ([memberSnapshotId, isRecipient]) => {
                  const recipient = existingMessage.recipients.find(
                    (r) => r.id === memberSnapshotId,
                  );

                  if (!recipient) {
                    throw new TRPCError({
                      code: "INTERNAL_SERVER_ERROR",
                    });
                  }

                  if (saveRecipientState) {
                    await prisma.member.update({
                      where: { id: recipient.memberId },
                      data: { isRecipient },
                    });
                  }

                  if (recipient?.isRecipient === isRecipient) return null;
                  return prisma.memberSnapshot.update({
                    where: { id: memberSnapshotId },
                    data: { isRecipient },
                  });
                },
              ),
            );

            // await updateReminders({
            //   messageId: data.id!,
            //   reminders,
            //   prisma,
            //   existingReminders: existingMessage.reminders,
            // });

            // update group member
            // if (saveRecipientState) {
            //   await Promise.all(
            //     Object.entries(recipients).map(
            //       async ([memberSnapshotId, isRecipient]) => {
            //         const recipient = existingMessage.recipients.find(
            //           (r) => r.id === memberSnapshotId,
            //         );

            //         if (recipient?.isRecipient === isRecipient) return null;
            //         return prisma.memberSnapshot.update({
            //           where: { id: memberSnapshotId },
            //           data: { isRecipient },
            //         });
            //       },
            //     ),
            //   );
            // }

            const updatedMessage = await prisma.message.update({
              where: { id: data.id },
              data,
            });

            return updatedMessage;

            // TODO actual send logic + cron jobs
          });
          return result;
        } catch (err) {
          throw handleError(err);
        }
      },
    ),
  delete: protectedProcedure
    .input(z.object({ messageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        await useRateLimit(userId);

        const message = await ctx.db.message.delete({
          where: { id: input.messageId },
        });

        // TODO: cancel send jobs if any (might need a transaction)
        return message;
      } catch (err) {
        throw handleError(err);
      }
    }),
  duplicate: protectedProcedure
    .input(z.object({ messageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        await useRateLimit(userId);

        const existingMessage = await ctx.db.message.findUnique({
          where: { id: input.messageId },
          select: {
            content: true,
            groupId: true,
            sentById: true,
            createdById: true,
            lastUpdatedById: true,
            isScheduled: true,
            scheduledDate: true,
            isRecurring: true,
            recurringNum: true,
            recurringPeriod: true,
            isReminders: true,
          },
        });

        if (!existingMessage) return throwMessageNotFoundError(input.messageId);

        const existingReminders = await ctx.db.reminder.findMany({
          where: { messageId: input.messageId },
        });

        const existingRecipients = await ctx.db.memberSnapshot.findMany({
          where: { messageId: input.messageId },
        });

        const newReminders = existingReminders.map((reminder) => ({
          ...reminder,
          id: undefined,
          messageId: undefined,
        }));

        const newRecipients = existingRecipients.map((recipient) => ({
          ...recipient,
          id: undefined,
          messageId: undefined,
        }));

        return await ctx.db.message.create({
          data: {
            ...existingMessage,
            status: "draft",
            recipients: { create: newRecipients },
            reminders: { create: newReminders },
          },
        });
      } catch (err) {
        throw handleError(err);
      }
    }),
  send: protectedProcedure
    .input(z.object({ messageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        await useRateLimit(userId);

        const existingMessage = await ctx.db.message.findUnique({
          where: { id: input.messageId },
          include: { recipients: true, reminders: true },
        });

        if (!existingMessage) return throwMessageNotFoundError(input.messageId);

        if (existingMessage?.status === "sent") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Message has already been sent",
          });
        }

        // TODO actual send logic + cron jobs (needs a transaction)

        return await ctx.db.message.update({
          where: { id: input.messageId },
          data: { status: "sent", sendAt: new Date() },
        });
      } catch (err) {
        throw handleError(err);
      }
    }),
  testSend: protectedProcedure
    .input(messageInputSchema)
    .mutation(
      async ({
        ctx,
        input: { groupId, reminders, saveRecipientState, recipients, ...input },
      }) => {
        const userId = ctx.session.user.id;

        try {
          await useRateLimit(userId);

          const user = await ctx.db.user.findUnique({
            where: { id: userId },
            include: {
              emailConfig: true,
              smsConfig: true,
              groupMeConfig: true,
            },
          });

          if (!user) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
            });
          }

          let existingMessage: MessageWithContacts | null = null;
          if (input.id) {
            existingMessage = await ctx.db.message.findUnique({
              where: { id: input.id, createdById: userId },
              include: {
                recipients: {
                  include: { member: { include: { contact: true } } },
                },
                reminders: true,
              },
            });
          }

          if (existingMessage?.status === "sent") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Message has already been sent",
            });
          }

          const { message, messageRecipients } = await ctx.db.$transaction(
            async (prisma) => {
              // create/update message
              let message: Message;
              if (!input?.id) {
                message = await prisma.message.create({
                  data: {
                    ...input,
                    sendAt: new Date(),
                    group: { connect: { id: groupId } },
                    sentBy: { connect: { id: userId } },
                    createdBy: { connect: { id: userId } },
                    lastUpdatedBy: { connect: { id: userId } },
                  },
                });
              } else {
                message = await prisma.message.update({
                  where: { id: input.id, createdById: userId },
                  data: { status: "sent", sendAt: new Date() },
                });
              }

              // create/update recipients
              const messageRecipients: MemberSnapshotWithContact[] = [];
              for (const [memberId, isRecipient] of Object.entries(
                recipients,
              )) {
                if (!existingMessage) {
                  const snapshot = await prisma.memberSnapshot.create({
                    data: {
                      isRecipient,
                      message: { connect: { id: message.id } },
                      member: { connect: { id: memberId } },
                    },
                    include: { member: { include: { contact: true } } },
                  });
                  if (isRecipient) messageRecipients.push(snapshot);
                } else {
                  const snapshot = await prisma.memberSnapshot.update({
                    where: { id: memberId },
                    data: { isRecipient },
                    include: { member: { include: { contact: true } } },
                  });
                  if (isRecipient) messageRecipients.push(snapshot);
                }

                if (saveRecipientState) {
                  await prisma.member.update({
                    where: { id: memberId },
                    data: { isRecipient },
                  });
                }
              }

              if (!messageRecipients.length) {
                throw new TRPCError({
                  code: "BAD_REQUEST",
                  message: "Message must have at least one recipient",
                });
              }

              // create/update reminders
              if (!reminders?.length) {
                await prisma.reminder.deleteMany({
                  where: { messageId: message.id },
                });
              } else if (!existingMessage?.reminders?.length) {
                await Promise.all(
                  reminders.map((reminder) => {
                    return prisma.reminder.create({
                      data: {
                        ...reminder,
                        message: { connect: { id: message?.id } },
                      },
                    });
                  }),
                );
              } else {
                const remindersToDelete = existingMessage.reminders
                  .filter((r) => !reminders.some((newR) => newR.id === r.id))
                  .map((r) => r.id);

                if (!!remindersToDelete.length) {
                  await prisma.reminder.deleteMany({
                    where: { id: { in: remindersToDelete } },
                  });
                }

                await Promise.all(
                  reminders.map((reminder) => {
                    if (!reminder.id) {
                      return prisma.reminder.create({
                        data: {
                          ...reminder,
                          message: { connect: { id: message?.id } },
                        },
                      });
                    } else {
                      return prisma.reminder.update({
                        where: { id: reminder.id },
                        data: reminder,
                      });
                    }
                  }),
                );
              }

              return { message, messageRecipients };
            },
          );

          // TODO cron shit

          try {
            const emailConfig = user.emailConfig;
            if (!!emailConfig) {
              await sendEmail({
                emailConfig: emailConfig,
                recipients: messageRecipients,
                message: message,
              });
            }

            // TODO send sms
            const smsConfig = user.smsConfig;
            if (!!smsConfig) {
              await sendSMS({
                smsConfig: smsConfig,
                recipients: messageRecipients,
                message: message,
              });
            }

            // TODO send groupme
            const groupMeConfig = user.groupMeConfig;
            if (!!groupMeConfig) {
              await sendGroupMe({
                groupMeConfig: groupMeConfig,
                recipients: messageRecipients,
                message: message,
              });
            }
          } catch (error) {
            await ctx.db.message.update({
              where: { id: message.id },
              data: { status: "failed" },
            });

            throw handleError(error);
          }
          return message;
        } catch (err) {
          throw handleError(err);
        }
      },
    ),
});

async function sendEmail({
  emailConfig,
  recipients,
  message,
}: {
  emailConfig: EmailConfig;
  recipients: MemberSnapshotWithContact[];
  message: Message;
}) {
  const { accessToken, refreshToken, email } = emailConfig;
  if (!email || !accessToken || !refreshToken) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Account is not properly configured to send email messages",
    });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: email,
      clientId: env.GOOGLE_ID_DEV,
      clientSecret: env.GOOGLE_SECRET_DEV,
      refreshToken: refreshToken,
      accessToken: accessToken,
    },
  });

  try {
    for (const recipient of recipients) {
      const recipientEmail = recipient.member.contact.email;
      if (!recipientEmail) return false;

      await transporter.sendMail({
        from: email,
        to: "jack.watters@me.com",
        // to: recipientEmail,
        subject: message.subject ? message.subject : undefined,
        text: message.content,
      });
    }
  } catch (err) {
    throw handleError(err);
  }
}

async function sendSMS({
  smsConfig,
  recipients,
  message,
}: {
  smsConfig: SmsConfig;
  recipients: MemberSnapshotWithContact[];
  message: Message;
}) {
  const { accountSid, authToken, phoneNumber } = smsConfig;
  const client = Client(accountSid, authToken);

  try {
    for (const recipient of recipients) {
      const recipientPhone = recipient.member.contact.phone;
      if (!recipientPhone) return false;

      await client.messages.create({
        from: phoneNumber,
        to: "+19544949167",
        // to: recipientPhone,
        body: message.content,
      });
    }
  } catch (err) {
    throw handleError(err);
  }
}

async function sendGroupMe({
  groupMeConfig,
  recipients,
  message,
}: {
  groupMeConfig: GroupMeConfig;
  recipients: MemberSnapshotWithContact[];
  message: Message;
}) {
  console.log("sendGroupMe");

  const { id, accessToken, userId } = groupMeConfig;

  try {
    for (const recipient of recipients) {
      const contact = recipient.member.contact;
      if (!contact) return false;

      log("sendGroupMe", contact, id, accessToken, userId, message);
    }
  } catch (err) {
    throw handleError(err);
  }
}

function throwMessageNotFoundError(messageId: string) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: `Message with id "${messageId}" not found`,
  });
}
