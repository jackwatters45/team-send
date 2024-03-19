import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { type IUser } from "./auth";
import { type IMember } from "./contact";
import messages from "./messages.json";

export interface IReminder {
  num: number;
  period: "months" | "weeks" | "days";
}

export interface IMessageScheduling {
  isScheduled: boolean;
  scheduledDate: Date | string | null;
  isRecurring: boolean;
  recurringNum: number | null;
  recurringPeriod: "years" | "months" | "weeks" | "days" | null;
  isReminders: boolean;
  reminders: IReminder[] | null;
}

export interface IMessageInput extends IMessageScheduling {
  content: string;
  recipients: IMember[];
  groupId: string;
}

export interface IMessage extends IMessageInput {
  id: string;
  sender: IUser;
  time: Date | string;
  status: "draft" | "sent" | "scheduled" | "failed";
}

export const messageRouter = createTRPCRouter({
  getMessageData: publicProcedure
    .input(z.string().optional())
    .query(({ input }) => {
      return messages.find((message) => message.id === input) as IMessage;
    }),
});
