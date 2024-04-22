import { z } from "zod";
import debug from "debug";
import type {
  Contact,
  Message,
  Prisma,
  PrismaClient,
  Reminder,
} from "@prisma/client";
import { Client as QStashClient } from "@upstash/qstash";
import { Redis } from "@upstash/redis";

import type { NewReminder } from "@/schemas/reminderSchema.ts";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { useRateLimit } from "@/server/helpers/rateLimit";
import { handleError } from "@/server/helpers/handleError";
import { env } from "@/env";
import {
  type MessageInputType,
  messageInputSchema,
} from "@/schemas/messageSchema";
import {
  getDelayInSec,
  getMessageKey,
  getPeriodMillis,
  getUserConfig,
} from "@/lib/utils";
import { validateRecurringData, validateScheduleDate } from "@/lib/validations";
import type { SendMessageBody } from "@/pages/api/sendMessage";

const log = debug("team-send:api:message");

export const upstash = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

const qstashClient = new QStashClient({
  token: env.QSTASH_TOKEN,
});

export type RecipientOnlyContact = { member: { contact: Contact } };

export type MessageWithMembersAndReminders = Message & {
  recipients: RecipientOnlyContact[];
  reminders: Reminder[];
};

export type PopulatedMessageWithGroupName = MessageWithMembersAndReminders & {
  group: { name: string };
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

        if (!message) throw messageNotFoundError(input.messageId);
        return message;
      } catch (err) {
        throw handleError(err);
      }
    }),
  delete: protectedProcedure
    .input(z.object({ messageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        await useRateLimit(userId);

        const message = await ctx.db.message.delete({
          where: { id: input.messageId },
          include: { reminders: true },
        });

        if (message.type === "scheduled") {
          await removeScheduledFromQStash(message.id, message.reminders);
        } else if (message.type === "recurring") {
          await removeRecurringFromQStash(message.id, message.reminders);
        }

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

        if (!existingMessage) throw messageNotFoundError(input.messageId);

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
    .input(messageInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        await useRateLimit(userId);

        let existingMessage: PopulatedMessageWithGroupName | null = null;
        if (input.id) {
          existingMessage = await ctx.db.message.findUnique({
            where: { id: input.id, createdById: userId },
            include: {
              recipients: {
                include: { member: { select: { contact: true } } },
              },
              reminders: true,
              group: { select: { name: true } },
            },
          });
        }

        if (input.id && !existingMessage) throw messageNotFoundError(input.id);
        else if (existingMessage?.status === "sent") {
          throw messageAlreadySentError(existingMessage.id);
        }

        const message = await updateMessage({
          db: ctx.db,
          message: input,
          existingMessage,
          userId,
        });

        if (message.status === "draft") return message;

        const user = await getUserConfig(userId, ctx.db);

        await sendMessage({ message, user }, ctx.db);

        return message;
      } catch (err) {
        throw handleError(err);
      }
    }),
  sendDraft: protectedProcedure
    .input(z.object({ messageId: z.string() }))
    .mutation(async ({ ctx, input: { messageId } }) => {
      const userId = ctx.session.user.id;

      try {
        await useRateLimit(userId);

        const result = await ctx.db.$transaction(async (prisma) => {
          const message = await prisma.message.update({
            where: { id: messageId, createdById: userId, status: "draft" },
            data: { status: "pending" },
            include: {
              recipients: {
                include: { member: { select: { contact: true } } },
              },
              reminders: true,
              group: { select: { name: true } },
            },
          });

          if (!message) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `Message with id "${messageId}" not found or not a draft`,
            });
          }

          const user = await getUserConfig(userId, prisma);

          await sendMessage({ message, user }, ctx.db);

          return message;
        });

        return result;
      } catch (err) {
        throw handleError(err);
      }
    }),
  sendNow: protectedProcedure
    .input(z.object({ messageId: z.string() }))
    .mutation(async ({ ctx, input: { messageId } }) => {
      const userId = ctx.session.user.id;

      try {
        await useRateLimit(userId);

        const result = await ctx.db.$transaction(async (prisma) => {
          // update message set sendAt to now, set isReminders/isScheduled to false
          const message = await prisma.message.update({
            where: {
              id: messageId,
              createdById: userId,
              status: "pending",
              type: "scheduled",
            },
            data: {
              sendAt: new Date(),
              isReminders: false,
              isScheduled: false,
            },
            include: {
              recipients: {
                include: { member: { select: { contact: true } } },
              },
              reminders: true,
              group: { select: { name: true } },
            },
          });

          if (!message) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `Message with id "${messageId}" not found or not a scheduled message`,
            });
          }

          // if any reminders, remove
          await prisma.reminder.deleteMany({
            where: { messageId: messageId },
          });

          for (const reminder of message.reminders) {
            const reminderKey = getMessageKey(message.id, reminder.id);
            const reminderId = await upstash.get<string>(reminderKey);

            if (reminderId) await qstashClient.messages.delete(reminderId);
            await upstash.del(reminderKey);
          }

          const user = await getUserConfig(userId, prisma);

          // send message now
          await sendOnce({ body: { message, user } });

          return message;
        });

        return result;
      } catch (err) {
        throw handleError(err);
      }
    }),
  retryFailedSend: protectedProcedure
    .input(z.object({ messageId: z.string() }))
    .mutation(async ({ ctx, input: { messageId } }) => {
      const userId = ctx.session.user.id;

      try {
        await useRateLimit(userId);

        const result = await ctx.db.$transaction(async (prisma) => {
          const message = await prisma.message.update({
            where: {
              id: messageId,
              createdById: userId,
              status: "failed",
              hasRetried: false,
            },
            data: { status: "pending", hasRetried: true },
            include: {
              recipients: {
                include: { member: { select: { contact: true } } },
              },
              reminders: true,
              group: { select: { name: true } },
            },
          });

          if (!message) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `Message with id "${messageId}" was either not found, already retried, or not a failed message`,
            });
          }

          const user = await getUserConfig(userId, prisma);

          await sendMessage({ message, user }, prisma);

          return message;
        });

        return result;
      } catch (err) {
        throw handleError(err);
      }
    }),
});

async function updateMessage({
  db,
  message: { recipients, reminders, saveRecipientState, ...messageData },
  existingMessage,
  userId,
}: {
  db: PrismaClient;
  message: MessageInputType;
  existingMessage: MessageWithMembersAndReminders | null;
  userId: string;
}): Promise<PopulatedMessageWithGroupName> {
  return await db.$transaction(async (prisma) => {
    const message = await updateMessageData({
      messageData,
      prisma,
      userId,
    });

    const [rec, rem] = await Promise.all([
      updateRecipients({
        messageId: message.id,
        prisma,
        recipients,
        isExistingMessage: !!existingMessage,
        saveRecipientState,
      }),
      updateReminders({
        messageId: message.id,
        reminders,
        prisma,
        existingReminders: existingMessage?.reminders,
      }),
    ]);

    return { ...message, recipients: rec, reminders: rem };
  });
}

type UpdateMessageInput = {
  content: Message["content"];
  groupId: Message["groupId"];
  isScheduled: Message["isScheduled"];
  isRecurring: Message["isRecurring"];
  isReminders: Message["isReminders"];
  status: Message["status"];
  type: Message["type"];
  id?: Message["id"];
  subject?: Message["subject"];
  scheduledDate?: Message["scheduledDate"];
  recurringNum?: Message["recurringNum"];
  recurringPeriod?: Message["recurringPeriod"];
};

async function updateMessageData({
  messageData: { groupId, ...messageData },
  prisma,
  userId,
}: {
  messageData: UpdateMessageInput;
  prisma: PrismaClient | Prisma.TransactionClient;
  userId: string;
}) {
  const sendAt = messageData.scheduledDate
    ? new Date(messageData.scheduledDate)
    : undefined;

  let message: Message & { group: { name: string } };
  if (!messageData?.id) {
    message = await prisma.message.create({
      data: {
        ...messageData,
        status: "pending",
        sendAt: sendAt,
        group: { connect: { id: groupId } },
        sentBy: { connect: { id: userId } },
        createdBy: { connect: { id: userId } },
        lastUpdatedBy: { connect: { id: userId } },
      },
      include: { group: { select: { name: true } } },
    });
  } else {
    message = await prisma.message.update({
      where: { id: messageData.id, createdById: userId },
      data: { ...messageData, status: "pending", sendAt: sendAt },
      include: { group: { select: { name: true } } },
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
}): Promise<RecipientOnlyContact[]> {
  const operations = [];
  const messageRecipients: RecipientOnlyContact[] = [];

  for (const [snapshotId, isRecipient] of Object.entries(recipients)) {
    const operation = (async () => {
      let memberId: string;
      if (!isExistingMessage) {
        const snapshot = await prisma.memberSnapshot.create({
          data: {
            isRecipient,
            message: { connect: { id: messageId } },
            member: { connect: { id: snapshotId } },
          },
          select: { member: { select: { contact: true, id: true } } },
        });
        memberId = snapshot.member.id;
        if (isRecipient) messageRecipients.push(snapshot);
      } else {
        const snapshot = await prisma.memberSnapshot.update({
          where: { id: snapshotId },
          data: { isRecipient },
          select: { member: { select: { contact: true, id: true } } },
        });
        memberId = snapshot.member.id;
        if (isRecipient) messageRecipients.push(snapshot);
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

// made sendMessage non breaking if invalid input -> just ignore and change send at
export async function sendMessage(
  body: SendMessageBody,
  db: PrismaClient | Prisma.TransactionClient,
) {
  const { isRecurring, isScheduled } = body.message;

  // not recurring or scheduled
  if (!isRecurring && !isScheduled) return await sendOnce({ body });

  // scheduled but not recurring
  if (isScheduled && !isRecurring) {
    const { reminders } = body.message;

    const sendAt = validateScheduleDate(body.message.scheduledDate);
    if (sendAt !== body.message.scheduledDate) {
      await db.message.update({
        where: { id: body.message.id, createdById: body.user.id },
        data: { sendAt: sendAt },
      });
    }

    const remindersToBeIgnored = [];
    for (const reminder of reminders) {
      const reminderDate = getReminderDate(reminder, sendAt);
      // if reminder date is in the past = false -> to be ignored
      if (!reminderDate) {
        remindersToBeIgnored.push(reminder.id);
        continue;
      }

      const reminderDelay = getDelayInSec(reminderDate);

      await sendOnce({ body, delay: reminderDelay, reminderId: reminder.id });
    }

    // mark reminder as ignored
    await db.reminder.updateMany({
      where: { id: { in: remindersToBeIgnored } },
      data: { isIgnored: true },
    });

    const messageDelay = getDelayInSec(sendAt);

    return await sendOnce({ body, delay: messageDelay });
  }

  // recurring but not scheduled
  if (isRecurring && !isScheduled) {
    const { recurringNum, recurringPeriod } = body.message;

    const recurData = validateRecurringData({ recurringNum, recurringPeriod });

    return await createRecurringMessage({ body, recurData });
  }

  // recurring and scheduled
  if (isRecurring && isScheduled) {
    const { recurringNum, recurringPeriod, scheduledDate } = body.message;

    const startDate = validateScheduleDate(scheduledDate);
    if (startDate !== body.message.scheduledDate) {
      await db.message.update({
        where: { id: body.message.id },
        data: { sendAt: startDate },
      });
    }

    const recurData = validateRecurringData({ recurringNum, recurringPeriod });

    const remindersToBeIgnored = [];
    for (const reminder of body.message.reminders) {
      const reminderDate = getReminderDate(reminder, startDate);
      // if reminder date is in the past = false -> to be ignored
      if (!reminderDate) {
        remindersToBeIgnored.push(reminder.id);
        continue;
      }

      await createRecurringMessage({
        body,
        startDate: reminderDate,
        reminderId: reminder.id,
        recurData,
      });
    }

    // mark reminder as ignored
    await db.reminder.updateMany({
      where: { id: { in: remindersToBeIgnored } },
      data: { isIgnored: true },
    });

    return await createRecurringMessage({ body, startDate, recurData });
  }
}

interface SendMessageInput {
  body: SendMessageBody;
  delay?: number;
  reminderId?: string;
}

async function sendOnce({ body, delay, reminderId }: SendMessageInput) {
  const key = getMessageKey(body.message.id, reminderId);

  const existingMessageId = await upstash.get<string>(key);
  if (existingMessageId) {
    await qstashClient.messages.delete(existingMessageId);
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

type RecurData = {
  recurringNum: number;
  recurringPeriod: Message["recurringPeriod"];
};

interface CreateRecurringMessageInput {
  body: SendMessageBody;
  recurData: RecurData;
  startDate?: Date;
  reminderId?: string;
}
async function createRecurringMessage({
  body,
  recurData,
  startDate = new Date(),
  reminderId,
}: CreateRecurringMessageInput) {
  const key = getMessageKey(body.message.id, reminderId);

  const existingMessageId = await upstash.get<string>(key);
  if (existingMessageId) {
    await qstashClient.schedules.delete(existingMessageId);
  }

  const cron = generateCronExpression({ startDate, recurData });

  const schedule = await qstashClient.schedules.create({
    destination: `${env.NGROK_URL}/api/sendMessage`,
    body: JSON.stringify(body),
    cron: cron,
  });

  await upstash.set(key, schedule.scheduleId);

  return schedule;
}

interface GenerateCronExpressionParams {
  startDate: Date;
  recurData: RecurData;
}
function generateCronExpression({
  startDate,
  recurData: { recurringPeriod, recurringNum },
}: GenerateCronExpressionParams): string {
  const minutes = startDate.getMinutes();
  const hours = startDate.getHours();
  const dayOfMonth = startDate.getDate();
  const month = startDate.getMonth() + 1;
  const dayOfWeek = startDate.getDay();

  switch (recurringPeriod) {
    case "days":
      return `${minutes} ${hours} */${recurringNum} * *`;
    case "weeks":
      return `${minutes} ${hours} * * ${dayOfWeek === 0 ? 7 : dayOfWeek}/7`;
    case "months":
      return `${minutes} ${hours} ${dayOfMonth} */${recurringNum} *`;
    case "years":
      return `${minutes} ${hours} ${dayOfMonth} ${month} */${recurringNum}`;
    default:
      throw new Error(
        "Invalid recurrence period. Choose from 'minute', 'hour', 'day', 'week', 'month', or 'year'.",
      );
  }
}

// TODO maybe change to sendAt? if send now -> sendAt is changed but scheduledDate is not
// 4/20/2024 13:20 -> where returning false was throwing error but want to just ignore invalid reminders
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
  if (isScheduledDatePast) return false;

  const reminderDiff = reminder.num * getPeriodMillis(reminder.period);

  const reminderDate = new Date(scheduledDate.getTime() - reminderDiff);

  const isReminderDatePast = reminderDate < new Date();
  if (isReminderDatePast) return false;

  return reminderDate;
}

async function removeScheduledFromQStash(
  messageId: string,
  reminders: Reminder[],
) {
  const messageKey = getMessageKey(messageId);

  const qStashId = await upstash.get<string>(messageKey);
  if (qStashId) await qstashClient.messages.delete(qStashId);

  for (const reminder of reminders) {
    const reminderKey = getMessageKey(messageId, reminder.id);

    const reminderId = await upstash.get<string>(reminderKey);
    if (reminderId) await qstashClient.messages.delete(reminderId);
  }
}

async function removeRecurringFromQStash(
  messageId: string,
  reminders: Reminder[],
) {
  const messageKey = getMessageKey(messageId);

  const qStashId = await upstash.get<string>(messageKey);
  if (qStashId) await qstashClient.schedules.delete(qStashId);

  for (const reminder of reminders) {
    const reminderKey = getMessageKey(messageId, reminder.id);

    const reminderId = await upstash.get<string>(reminderKey);
    if (reminderId) await qstashClient.schedules.delete(reminderId);
  }
}

function messageNotFoundError(messageId: string) {
  return new TRPCError({
    code: "NOT_FOUND",
    message: `Message with id "${messageId}" not found`,
  });
}

function messageAlreadySentError(messageId: string) {
  return new TRPCError({
    code: "BAD_REQUEST",
    message: `Message with id "${messageId}" has already been sent`,
  });
}
