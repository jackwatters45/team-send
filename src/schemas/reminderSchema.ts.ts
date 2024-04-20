import type { ReminderPeriod } from "@prisma/client";
import { z } from "zod";

export const reminderPeriod = [
  "minutes",
  "hours",
  "months",
  "weeks",
  "days",
] as const;

export const defaultReminderConstraints: Record<
  ReminderPeriod,
  { max: number; min: number; maxLength: number; value: ReminderPeriod }
> = {
  minutes: { max: 59, min: 5, maxLength: 2, value: "minutes" },
  hours: { max: 24, min: 1, maxLength: 2, value: "hours" },
  days: { max: 15, min: 1, maxLength: 2, value: "days" },
  weeks: { max: 3, min: 1, maxLength: 1, value: "weeks" },
  months: { max: 6, min: 1, maxLength: 1, value: "months" },
} as const;

export const reminderSchema = z
  .object({
    id: z.string().optional(),
    num: z.number().positive().int().max(31),
    period: z.enum(reminderPeriod),
  })
  .refine(
    (data) => {
      if (
        data.num > defaultReminderConstraints[data.period].max ||
        data.num < defaultReminderConstraints[data.period].min
      )
        return false;

      return true;
    },
    {
      message: "Validation error in reminder schema",
    },
  );

export type NewReminder = z.infer<typeof reminderSchema>;

export const defaultReminder: z.infer<typeof reminderSchema> = {
  num: 15,
  period: "minutes",
};
