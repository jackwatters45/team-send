import { z } from "zod";
import debug from "debug";
import nodemailer from "nodemailer";
import type { MemberSnapshot } from "@prisma/client";
import Client from "twilio";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { useRateLimit } from "@/server/helpers/rateLimit";
import { handleError } from "@/server/helpers/handleError";
import { env } from "@/env";
import { messageInputSchema } from "@/lib/schemas/messageSchema";

const log = debug("team-send:api:message");

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
        input: { reminders, saveRecipientState, recipients, ...data },
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

          const existingMessage = await ctx.db.message.findFirst({
            where: { id: input.id },
            include: {
              recipients: {
                include: { member: { include: { contact: true } } },
              },
              reminders: true,
            },
          });

          if (existingMessage?.status === "sent") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Message has already been sent",
            });
          }

          const result = await ctx.db.$transaction(async (prisma) => {
            // create/update message
            let message;
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
                where: { id: input.id },
                data: { status: "sent", sendAt: new Date() },
              });
            }

            // create/update recipients
            const messageRecipients: MemberSnapshot[] = [];
            for (const [memberId, isRecipient] of Object.entries(recipients)) {
              if (!existingMessage) {
                const snapshot = await prisma.memberSnapshot.create({
                  data: {
                    isRecipient,
                    message: { connect: { id: message.id } },
                    member: { connect: { id: memberId } },
                  },
                });
                if (isRecipient) messageRecipients.push(snapshot);
              } else {
                const snapshot = await prisma.memberSnapshot.update({
                  where: { id: memberId },
                  data: { isRecipient },
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
                      message: { connect: { id: message.id } },
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
                        message: { connect: { id: message.id } },
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

            // TODO cron shit

            // send email
            const emailConfig = user.emailConfig;
            if (!!emailConfig) {
              const { accessToken, refreshToken } = emailConfig;
              if (!user.email || !accessToken || !refreshToken) {
                throw new TRPCError({
                  code: "BAD_REQUEST",
                  message:
                    "Account is not properly configured to send email messages",
                });
              }

              const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                  type: "oauth2",
                  user: user.email,
                  clientId: env.GOOGLE_ID_DEV,
                  clientSecret: env.GOOGLE_SECRET_DEV,
                  refreshToken: refreshToken,
                  accessToken: accessToken,
                },
              });

              // TODO: get working + specific email shit
              await transporter.sendMail({
                from: user.email,
                to: "jack.watters@me.com",
                subject: "Test Email",
                text: "existingMessage.content",
              });
            }

            // TODO send sms
            if (!!user.smsConfig) {
              const { accountSid, authToken, phoneNumber } = user.smsConfig;
              const client = Client(accountSid, authToken);

              const smsMessage = await client.messages.create({
                from: phoneNumber,
                to: "+19544949167",
                body: message.content,
              });

              log(smsMessage);
            }

            // TODO send groupme
            if (!!user.groupMeConfig) {
              await sendGroupMe();
            }

            // TODO what
            return await ctx.db.message.update({
              where: { id: message.id },
              data: { status: "sent", sendAt: new Date() },
            });
          });

          return result;
        } catch (err) {
          throw handleError(err);
        }
      },
    ),
});

function throwMessageNotFoundError(messageId: string) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: `Message with id "${messageId}" not found`,
  });
}

// async function updateMembers({
//   recipients,
//   prevRecipients,
//   prisma,
//   saveRecipientState,
// }: {
//   recipients: Record<string, boolean>;
//   prevRecipients: MemberSnapshot[] | undefined;
//   prisma: Prisma.TransactionClient;
//   saveRecipientState: boolean;
// }) {
//   if (!prevRecipients) {
//     // create snapshots
//     for (const [memberId, isRecipient] of Object.entries(recipients)) {
//       await prisma.memberSnapshot.create({
//         data: {
//           isRecipient,
//           member: { connect: { id: memberId } },
//         },
//       });
//     }

//     if (saveRecipientState) {
//       // update members
//     }
//   }
//   //
//   // add isDraft + scheduled considerations
//   //
//   // TODO if existing
//   await Promise.all(
//     Object.entries(recipients).map(async ([memberSnapshotId, isRecipient]) => {
//       const recipient = existingMessage?.recipients.find(
//         (r) => r.id === memberSnapshotId,
//       );

//       if (!recipient) {
//         throw new TRPCError({
//           code: "INTERNAL_SERVER_ERROR",
//         });
//       }

//       if (saveRecipientState) {
//         await prisma.member.update({
//           where: { id: recipient.memberId },
//           data: { isRecipient },
//         });
//       }

//       if (recipient?.isRecipient === isRecipient) return null;
//       return prisma.memberSnapshot.update({
//         where: { id: memberSnapshotId },
//         data: { isRecipient },
//       });
//     }),
//   );
// }

// async function sendEmail({
//   emailConfig,
//   recipients,
//   fromEmail,
// }: {
//   emailConfig: EmailConfig;
//   recipients: MemberSnapshot[] | undefined;
//   fromEmail: string | null;
// }) {

// }

async function sendSMS() {
  console.log("sendSMS");
}

async function sendGroupMe() {
  console.log("sendGroupMe");
}
