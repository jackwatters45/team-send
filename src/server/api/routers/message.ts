import { type IUser } from "./auth";
import { type IMember } from "./contact";

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
}

export interface IMessage extends IMessageInput {
  id: string;
  sender: IUser;
  time: Date | string;
}
