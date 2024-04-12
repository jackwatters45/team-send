import { z } from "zod";
import debug from "debug";
import nodemailer from "nodemailer";
import type {
  EmailConfig,
  GroupMeConfig,
  Message,
  Prisma,
  PrismaClient,
  Reminder,
  SmsConfig,
} from "@prisma/client";
import TwilioClient from "twilio";
import { Client as QStashClient } from "@upstash/qstash";

import type { NewReminder } from "@/schemas/reminderSchema.ts";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { useRateLimit } from "@/server/helpers/rateLimit";
import { handleError } from "@/server/helpers/handleError";
import { env } from "@/env";
import {
  type MessagePeriod,
  messageInputSchema,
} from "@/schemas/messageSchema";
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

          const existingMessage = await ctx.db.message.findUnique({
            where: { id: data.id, createdById: userId },
            include: {
              recipients: {
                include: { member: { include: { contact: true } } },
              },
              reminders: true,
            },
          });

          if (!existingMessage) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `Message with id "${data.id}" not found`,
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
              // update message
              const message = await updateMessage({
                messageData: data,
                prisma,
                userId,
              });

              // update recipients
              const messageRecipients = await updateRecipients({
                messageId: message.id,
                prisma,
                recipients,
                isExistingMessage: !!existingMessage,
                saveRecipientState,
              });

              // update reminders
              await updateReminders({
                messageId: message.id,
                reminders,
                prisma,
                existingReminders: existingMessage.reminders,
              });

              return { message, messageRecipients };
            },
          );

          try {
            // send message
            const emailConfig = user.emailConfig;
            if (!!emailConfig) {
              await sendEmail({
                emailConfig: emailConfig,
                recipients: messageRecipients,
                message: message,
              });
            }

            const smsConfig = user.smsConfig;
            if (!!smsConfig) {
              await sendSMS({
                smsConfig: smsConfig,
                recipients: messageRecipients,
                message: message,
              });
            }

            // TODO cron/schedule shit
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
  saveDraft: protectedProcedure
    .input(messageInputSchema)
    .mutation(
      async ({
        ctx,
        input: { reminders, saveRecipientState, recipients, ...input },
      }) => {
        const userId = ctx.session.user.id;

        try {
          await useRateLimit(userId);

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

          const message = await ctx.db.$transaction(async (prisma) => {
            // create/update message
            const message = await updateMessage({
              messageData: input,
              prisma,
              userId,
            });

            // create/update recipients
            const messageRecipients = await updateRecipients({
              messageId: message.id,
              prisma,
              recipients,
              isExistingMessage: !!existingMessage,
              saveRecipientState,
            });

            // create/update reminders
            const updatedReminders = await updateReminders({
              messageId: message.id,
              reminders,
              prisma,
              existingReminders: existingMessage?.reminders,
            });

            return { messageRecipients, updatedReminders, ...message };
          });

          return message;
        } catch (err) {
          throw handleError(err);
        }
      },
    ),
  send: protectedProcedure
    .input(messageInputSchema)
    .mutation(
      async ({
        ctx,
        input: { reminders, saveRecipientState, recipients, ...input },
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
              const message = await updateMessage({
                messageData: input,
                prisma,
                userId,
              });

              // create/update recipients
              const messageRecipients = await updateRecipients({
                messageId: message.id,
                prisma,
                recipients,
                isExistingMessage: !!existingMessage,
                saveRecipientState,
              });

              // create/update reminders
              await updateReminders({
                messageId: message.id,
                reminders,
                prisma,
                existingReminders: existingMessage?.reminders,
              });

              return { message, messageRecipients };
            },
          );

          const qstashClient = new QStashClient({
            token: env.QSTASH_TOKEN,
          });

          const res = await qstashClient.publishJSON({
            url: "https://jackwatters.requestcatcher.com/",
            // url: `${env.BASE_URL}/api/sendMessage`,
            body: message,
          });

          return message;
          // send message
          try {
            const emailConfig = user.emailConfig;
            if (!!emailConfig) {
              await sendEmail({
                emailConfig: emailConfig,
                recipients: messageRecipients,
                message: message,
              });
            }

            const smsConfig = user.smsConfig;
            if (!!smsConfig) {
              await sendSMS({
                smsConfig: smsConfig,
                recipients: messageRecipients,
                message: message,
              });
            }

            // TODO cron/schedule shit
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

type UpdateMessageInput = {
  content: string;
  groupId: string;
  isScheduled: boolean;
  isRecurring: boolean;
  isReminders: boolean;
  status: "draft" | "scheduled" | "sent" | "failed";
  id?: string | undefined;
  subject?: string | null | undefined;
  scheduledDate?: Date | null | undefined;
  recurringNum?: number | null | undefined;
  recurringPeriod?: MessagePeriod | null | undefined;
};

async function updateMessage({
  messageData: { groupId, ...messageData },
  prisma,
  userId,
}: {
  messageData: UpdateMessageInput;
  prisma: PrismaClient | Prisma.TransactionClient;
  userId: string;
}) {
  let message: Message;
  if (!messageData?.id) {
    message = await prisma.message.create({
      data: {
        ...messageData,
        sendAt: new Date(),
        group: { connect: { id: groupId } },
        sentBy: { connect: { id: userId } },
        createdBy: { connect: { id: userId } },
        lastUpdatedBy: { connect: { id: userId } },
      },
    });
  } else {
    message = await prisma.message.update({
      where: { id: messageData.id, createdById: userId },
      data: { status: "sent", sendAt: new Date() },
    });
  }

  return message;
}
async function updateRecipients({
  messageId,
  prisma,
  recipients,
  isExistingMessage,
  saveRecipientState,
}: {
  messageId: string;
  prisma: PrismaClient | Prisma.TransactionClient;
  recipients: Record<string, boolean>;
  isExistingMessage: boolean;
  saveRecipientState: boolean;
}) {
  const messageRecipients: MemberSnapshotWithContact[] = [];
  for (const [memberId, isRecipient] of Object.entries(recipients)) {
    if (!isExistingMessage) {
      const snapshot = await prisma.memberSnapshot.create({
        data: {
          isRecipient,
          message: { connect: { id: messageId } },
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

  return messageRecipients;
}

const updateReminders = async ({
  messageId,
  prisma,
  reminders,
  existingReminders,
}: {
  messageId: string;
  prisma: PrismaClient | Prisma.TransactionClient;
  reminders: NewReminder[] | undefined | null;
  existingReminders: Reminder[] | undefined;
}): Promise<Reminder[]> => {
  if (!reminders?.length) {
    await prisma.reminder.deleteMany({
      where: { messageId: messageId },
    });

    return [];
  } else if (!existingReminders?.length) {
    return await Promise.all(
      reminders.map((reminder) => {
        return prisma.reminder.create({
          data: {
            ...reminder,
            message: { connect: { id: messageId } },
          },
        });
      }),
    );
  } else {
    const remindersToDelete = existingReminders
      .filter((r) => !reminders.some((newR) => newR.id === r.id))
      .map((r) => r.id);

    if (!!remindersToDelete.length) {
      await prisma.reminder.deleteMany({
        where: { id: { in: remindersToDelete } },
      });
    }

    const [newReminders, updatedReminders] = reminders.reduce(
      ([newReminders, updatedReminders], reminder) => {
        if (!reminder.id) {
          newReminders.push(reminder);
        } else {
          updatedReminders.push(reminder);
        }
        return [newReminders, updatedReminders];
      },
      [[], []] as [NewReminder[], NewReminder[]],
    );

    return await Promise.all([
      ...newReminders.map((reminder) => {
        return prisma.reminder.create({
          data: {
            ...reminder,
            message: { connect: { id: messageId } },
          },
        });
      }),
      ...updatedReminders.map((reminder) => {
        return prisma.reminder.update({
          where: { id: reminder.id },
          data: reminder,
        });
      }),
    ]);
  }
};

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
  const client = TwilioClient(accountSid, authToken);

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
