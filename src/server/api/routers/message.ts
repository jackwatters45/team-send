import { z } from "zod";
import debug from "debug";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { type User } from "./auth";
import { type Group } from "./group";
import { type Member } from "./member";
import { TRPCError } from "@trpc/server";
import { reminderSchema } from "@/lib/schemas/reminderSchema.ts";
import { useRateLimit } from "@/server/helpers/rateLimit";
import { handleError } from "@/server/helpers/handleError";

const log = debug("team-send:api:message");

export type ReminderPeriod = "months" | "weeks" | "days";
export interface IReminder {
  id: string;
  num: number;
  period: ReminderPeriod;
  message: Message;
  messageId: string;
}

export type RecurPeriod = "years" | "months" | "weeks" | "days";
export interface IMessageScheduling {
  isScheduled: boolean;
  scheduledDate: Date | string | undefined;
  isRecurring: boolean;
  recurringNum: number | undefined;
  recurringPeriod: RecurPeriod | undefined;
  isReminders: boolean;
  reminders: IReminder[] | undefined;
}

export interface IMessageInput extends IMessageScheduling {
  content: string;
  recipients: Member[];
  groupId: string;
}

export interface IMessageMetaDetails {
  group: Group;
  sendAt: Date;
  sentBy: User;
  sentById: string;

  createdAt: Date;
  createdBy: User;
  createdById: string;

  updatedAt: Date;
  lastUpdatedBy: User;
  lastUpdatedById: string;
}

export type Message = IMessageInput &
  IMessageMetaDetails & {
    id: string;
    status: "draft" | "sent" | "scheduled" | "failed";
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
            recipients: { include: { contact: true } },
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
    .input(
      z
        .object({
          id: z.string().optional(),
          status: z.enum(["draft", "scheduled", "sent", "failed"]),
          content: z.string().max(500).min(1),
          isScheduled: z.boolean(),
          scheduledDate: z.date().nullish(),
          isRecurring: z.boolean(),
          recurringNum: z.number().positive().int().max(36).nullish(),
          recurringPeriod: z
            .enum(["years", "months", "weeks", "days"])
            .nullish(),
          isReminders: z.boolean(),
          reminders: z.array(reminderSchema).max(6).nullish(),
          saveRecipientState: z.boolean(),
          recipients: z.record(z.string(), z.boolean()),
        })
        .refine(
          (data) => {
            if (data.isScheduled && data.scheduledDate === undefined) {
              return false;
            }
            if (
              data.isRecurring &&
              (data.recurringNum === undefined ||
                data.recurringPeriod === undefined)
            ) {
              return false;
            }
            if (
              data.isReminders &&
              (data.reminders === undefined || data.reminders?.length === 0)
            ) {
              return false;
            }

            return true;
          },
          {
            message:
              "Required fields are missing based on the conditional selections.",
            path: [
              "scheduledDate",
              "recurringNum",
              "recurringPeriod",
              "reminders",
            ],
          },
        ),
    )
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

            // update group member
            if (saveRecipientState) {
              await Promise.all(
                Object.entries(recipients).map(
                  async ([memberSnapshotId, isRecipient]) => {
                    const recipient = existingMessage.recipients.find(
                      (r) => r.id === memberSnapshotId,
                    );

                    if (recipient?.isRecipient === isRecipient) return null;
                    return prisma.memberSnapshot.update({
                      where: { id: memberSnapshotId },
                      data: { isRecipient },
                    });
                  },
                ),
              );
            }

            // reminders
            if (!reminders?.length && existingMessage.reminders?.length) {
              await prisma.reminder.deleteMany({
                where: { messageId: data.id },
              });
            } else if (
              !existingMessage.reminders?.length &&
              reminders?.length
            ) {
              await Promise.all(
                reminders.map((reminder) => {
                  return prisma.reminder.create({
                    data: {
                      ...reminder,
                      message: { connect: { id: data.id } },
                    },
                  });
                }),
              );
            } else {
              const remindersToDelete = existingMessage.reminders
                .filter((r) => !reminders!.some((newR) => newR.id === r.id))
                .map((r) => r.id);
              if (remindersToDelete.length) {
                await prisma.reminder.deleteMany({
                  where: { id: { in: remindersToDelete } },
                });
              }

              await Promise.all(
                reminders?.map((reminder) => {
                  return prisma.reminder.upsert({
                    where: { id: reminder?.id ?? "" },
                    update: { ...reminder },
                    create: {
                      ...reminder,
                      message: { connect: { id: data.id } },
                    },
                  });
                }) ?? [],
              );
            }

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
});

function throwMessageNotFoundError(messageId: string) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: `Message with id "${messageId}" not found`,
  });
}
