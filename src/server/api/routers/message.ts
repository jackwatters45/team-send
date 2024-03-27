import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { type User } from "./auth";
import { type Member } from "./contact";
import { type Group } from "./group";

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

  sentAt: Date;
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
    .input(
      z.object({
        messageId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.message.findUnique({
        where: { id: input.messageId },
        include: {
          sentBy: true,
          recipients: { include: { contact: true } },
          reminders: true,
        },
      });
    }),
});
