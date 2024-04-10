import type { Message } from "@prisma/client";
import { z } from "zod";

const reminderPeriod = ["months", "weeks", "days"] as const;
type ReminderPeriod = (typeof reminderPeriod)[number];

export interface Reminder {
  id: string;
  num: number;
  period: ReminderPeriod;
  message: Message;
  messageId: string;
}

export const reminderSchema = z.object({
  id: z.string().optional(),
  num: z.number().positive().int().max(36),
  period: z.enum(reminderPeriod),
});

export const defaultReminder: z.infer<typeof reminderSchema> = {
  num: 1,
  period: "weeks",
};
