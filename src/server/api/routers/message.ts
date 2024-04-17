import { z } from "zod";
import debug from "debug";
import type {
  Contact,
  EmailConfig,
  GroupMeConfig,
  Message,
  Prisma,
  PrismaClient,
  Reminder,
  SmsConfig,
} from "@prisma/client";
import { Client as QStashClient } from "@upstash/qstash";
import { Redis } from "@upstash/redis";

import type { NewReminder } from "@/schemas/reminderSchema.ts";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { useRateLimit } from "@/server/helpers/rateLimit";
import { handleError } from "@/server/helpers/handleError";
import { env } from "@/env";
import { messageInputSchema } from "@/schemas/messageSchema";
import { getDelayInSec, getPeriodMillis } from "@/lib/utils";
import { validateRecurringData, validateScheduleDate } from "@/lib/validations";

const log = debug("team-send:api:message");

export const upstash = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

const qstashClient = new QStashClient({
  token: env.QSTASH_TOKEN,
});

type RecipientWithOnlyContact = { member: { contact: Contact } };

type MessageWithMembersAndReminders = Message & {
  recipients: RecipientWithOnlyContact[];
  reminders: Reminder[];
};

type MessageWithContactsAndReminders = Message & {
  recipients: Contact[];
  reminders: Reminder[];
};

// TODO update other routes
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
                select: { member: { select: { contact: true } } },
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

          const message = await ctx.db.$transaction(async (prisma) => {
            // update message
            const message = await updateMessage({
              messageData: data,
              prisma,
              userId,
            });

            // update recipients
            const rec = await updateRecipients({
              messageId: message.id,
              prisma,
              recipients,
              isExistingMessage: !!existingMessage,
              saveRecipientState,
            });

            // update reminders
            const rem = await updateReminders({
              messageId: message.id,
              reminders,
              prisma,
              existingReminders: existingMessage.reminders,
            });

            return { ...message, recipients: rec, reminders: rem };
          });

          try {
            // send message
            await sendMessage({
              message,
              emailConfig: user.emailConfig,
              smsConfig: user.smsConfig,
              groupMeConfig: user.groupMeConfig,
            });
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

          let existingMessage: MessageWithMembersAndReminders | null = null;
          if (input.id) {
            existingMessage = await ctx.db.message.findUnique({
              where: { id: input.id, createdById: userId },
              include: {
                recipients: {
                  select: { member: { select: { contact: true } } },
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
  sendExisting: protectedProcedure
    .input(z.object({ messageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
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
          where: { id: input.messageId, createdById: userId },
          include: {
            recipients: {
              select: { member: { select: { contact: true } } },
            },
            reminders: true,
          },
        });

        if (!existingMessage) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Message with id "${input.messageId}" not found`,
          });
        }

        if (existingMessage?.status === "sent") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Message has already been sent",
          });
        }

        const message = await ctx.db.message.update({
          where: { id: input.messageId },
          data: { status: "sent", sendAt: new Date() },
          include: {
            reminders: true,
            recipients: { select: { member: { select: { contact: true } } } },
          },
        });
        const recipients = message.recipients.map((r) => r.member.contact);

        // send message
        try {
          await sendMessage({
            message: {
              ...message,
              recipients: recipients,
            },
            emailConfig: user.emailConfig,
            smsConfig: user.smsConfig,
            groupMeConfig: user.groupMeConfig,
          });
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
    }),
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

          let existingMessage: MessageWithMembersAndReminders | null = null;
          if (input.id) {
            existingMessage = await ctx.db.message.findUnique({
              where: { id: input.id, createdById: userId },
              include: {
                recipients: {
                  select: { member: { select: { contact: true } } },
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

            const [rec, rem] = await Promise.all([
              // create/update recipients
              updateRecipients({
                messageId: message.id,
                prisma,
                recipients,
                isExistingMessage: !!existingMessage,
                saveRecipientState,
              }),
              // create/update reminders
              updateReminders({
                messageId: message.id,
                reminders,
                prisma,
                existingReminders: existingMessage?.reminders,
              }),
            ]);

            return { ...message, recipients: rec, reminders: rem };
          });

          await sendMessage({
            message,
            emailConfig: user.emailConfig,
            smsConfig: user.smsConfig,
            groupMeConfig: user.groupMeConfig,
          });

          return message;
        } catch (err) {
          throw handleError(err);
        }
      },
    ),
});

type UpdateMessageInput = {
  content: Message["content"];
  groupId: Message["groupId"];
  isScheduled: Message["isScheduled"];
  isRecurring: Message["isRecurring"];
  isReminders: Message["isReminders"];
  status: Message["status"];
  id?: Message["id"];
  subject?: Message["subject"];
  scheduledDate?: Message["scheduledDate"];
  recurringNum?: Message["recurringNum"];
  recurringPeriod?: Message["recurringPeriod"];
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
        sendAt: messageData.scheduledDate
          ? new Date(messageData.scheduledDate)
          : undefined,
        group: { connect: { id: groupId } },
        sentBy: { connect: { id: userId } },
        createdBy: { connect: { id: userId } },
        lastUpdatedBy: { connect: { id: userId } },
      },
    });
  } else {
    message = await prisma.message.update({
      where: { id: messageData.id, createdById: userId },
      data: {
        status: "sent",
        sendAt: messageData.scheduledDate
          ? new Date(messageData.scheduledDate)
          : undefined,
      },
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
}): Promise<Contact[]> {
  const operations = [];
  const messageRecipients: Contact[] = [];

  for (const [memberId, isRecipient] of Object.entries(recipients)) {
    const operation = (async () => {
      if (!isExistingMessage) {
        const snapshot = await prisma.memberSnapshot.create({
          data: {
            isRecipient,
            message: { connect: { id: messageId } },
            member: { connect: { id: memberId } },
          },
          select: { member: { select: { contact: true } } },
        });
        if (isRecipient) messageRecipients.push(snapshot.member.contact);
      } else {
        const snapshot = await prisma.memberSnapshot.update({
          where: { id: memberId },
          data: { isRecipient },
          select: { member: { select: { contact: true } } },
        });
        if (isRecipient) messageRecipients.push(snapshot.member.contact);
      }

      if (saveRecipientState) {
        await prisma.member.update({
          where: { id: memberId },
          data: { isRecipient },
        });
      }
    })();
    operations.push(operation);
  }

  await Promise.all(operations);

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

export type SendMessageBody = {
  message: MessageWithContactsAndReminders;
  emailConfig: EmailConfig | null;
  smsConfig: SmsConfig | null;
  groupMeConfig: GroupMeConfig | null;
};

export async function sendMessage(body: SendMessageBody) {
  const { isRecurring, isScheduled } = body.message;

  if (!isRecurring && !isScheduled) {
    await sendOnce({ body });
  } else if (isScheduled && !isRecurring) {
    await sendScheduledNotRecurring(body);
  } else if (isRecurring && !isScheduled) {
    await sendRecurringNotScheduled(body);
  } else if (isRecurring && isScheduled) {
    await sendRecurringScheduled(body);
  }
}

interface SendMessageInput {
  body: SendMessageBody;
  delay?: number;
  reminderId?: string;
}

async function sendOnce({ body, delay, reminderId }: SendMessageInput) {
  const key = reminderId
    ? `message-${body.message.id}-reminder-${reminderId}`
    : `message-${body.message.id}`;

  const existingMessageId = await upstash.get(key);
  if (existingMessageId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Message with id "${body.message.id}" is already scheduled`,
    });
  }

  const message = await qstashClient.publishJSON({
    url: `${env.NGROK_URL}/api/sendMessage`,
    body: body,
    deduplicationId: key,
    delay: delay,
  });

  await upstash.set(key, message.messageId);

  return message;
}

async function sendScheduledNotRecurring(body: SendMessageBody) {
  const { reminders, isReminders } = body.message;

  const scheduledDate = validateScheduleDate(body.message.scheduledDate);

  if (isReminders) {
    if (!reminders?.length) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Message must have at least one reminder",
      });
    }

    for (const reminder of reminders) {
      const reminderDate = getReminderDate(reminder, scheduledDate);

      const reminderDelay = getDelayInSec(reminderDate);

      await sendOnce({ body, delay: reminderDelay, reminderId: reminder.id });
    }
  }

  const messageDelay = getDelayInSec(scheduledDate);

  return await sendOnce({ body, delay: messageDelay });
}

async function sendRecurringNotScheduled(body: SendMessageBody) {
  const { recurringNum, recurringPeriod } = validateRecurringData({
    recurringNum: body.message.recurringNum,
    recurringPeriod: body.message.recurringPeriod,
  });

  return await createRecurringMessage({
    body,
    recurringNum,
    recurringPeriod,
  });
}

async function sendRecurringScheduled(body: SendMessageBody) {
  const { reminders, isReminders } = body.message;

  const scheduledDate = validateScheduleDate(body.message.scheduledDate);

  const { recurringNum, recurringPeriod } = validateRecurringData({
    recurringNum: body.message.recurringNum,
    recurringPeriod: body.message.recurringPeriod,
  });

  if (isReminders) {
    if (!reminders?.length) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Message must have at least one reminder",
      });
    }

    for (const reminder of reminders) {
      const reminderDate = getReminderDate(reminder, scheduledDate);

      await createRecurringMessage({
        body,
        recurringNum,
        recurringPeriod,
        startDate: reminderDate,
        reminderId: reminder.id,
      });
    }
  }

  await createRecurringMessage({
    body,
    recurringNum,
    recurringPeriod,
    startDate: scheduledDate,
  });
}

interface CreateRecurringMessageInput {
  body: SendMessageBody;
  recurringNum: number;
  recurringPeriod: Message["recurringPeriod"];
  startDate?: Date;
  reminderId?: string;
}

async function createRecurringMessage({
  body,
  recurringNum,
  recurringPeriod,
  startDate,
  reminderId,
}: CreateRecurringMessageInput) {
  const key = reminderId
    ? `message-${body.message.id}-reminder-${reminderId}`
    : `message-${body.message.id}`;

  const existingMessageId = await upstash.get(key);
  if (existingMessageId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Message with id "${body.message.id}" is already scheduled`,
    });
  }

  const cron = generateCronExpression({
    startDate: startDate ?? new Date(),
    recurPeriod: recurringPeriod,
    recurNum: recurringNum,
  });

  const schedule = await qstashClient.schedules.create({
    destination: `${env.NGROK_URL}/api/sendMessage`,
    body: JSON.stringify(body),
    cron: cron,
  });

  await upstash.set(key, schedule.scheduleId);

  return schedule;
}

function generateCronExpression({
  startDate,
  recurPeriod,
  recurNum,
}: {
  startDate: Date;
  recurPeriod: Message["recurringPeriod"];
  recurNum: number;
}): string {
  const minutes = startDate.getMinutes();
  const hours = startDate.getHours();
  const dayOfMonth = startDate.getDate();
  const month = startDate.getMonth() + 1; // JS months are zero-indexed
  const dayOfWeek = startDate.getDay();

  switch (recurPeriod) {
    case "days":
      return `${minutes} ${hours} */${recurNum} * *`;
    case "weeks":
      return `${minutes} ${hours} * * ${dayOfWeek === 0 ? 7 : dayOfWeek}/7`;
    case "months":
      return `${minutes} ${hours} ${dayOfMonth} */${recurNum} *`;
    case "years":
      return `${minutes} ${hours} ${dayOfMonth} ${month} */${recurNum}`;
    default:
      throw new Error(
        "Invalid recurrence period. Choose from 'minute', 'hour', 'day', 'week', 'month', or 'year'.",
      );
  }
}

function getReminderDate(reminder: Reminder, scheduledDate: Date | null) {
  if (!scheduledDate) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Scheduled date is required for reminders",
    });
  }

  if (!reminder.num || !reminder.period) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Reminder number and period are required",
    });
  }

  const isScheduledDatePast = scheduledDate < new Date();
  if (isScheduledDatePast) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Scheduled date must be in the future",
    });
  }

  const reminderDiff = reminder.num * getPeriodMillis(reminder.period);

  const reminderDate = new Date(scheduledDate.getTime() - reminderDiff);

  const isReminderDatePast = reminderDate < new Date();
  if (isReminderDatePast) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Reminder date must be in the future",
    });
  }

  return reminderDate;
}

function throwMessageNotFoundError(messageId: string) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: `Message with id "${messageId}" not found`,
  });
}
