import { z } from "zod";

export const reminderPeriod = [
  "months",
  "weeks",
  "days",
  "hours",
  "minutes",
] as const;

const maxValues = {
  days: 15,
  weeks: 3,
  months: 6,
  hours: 24,
  minutes: 59,
} as const;

export const reminderSchema = z
  .object({
    id: z.string().optional(),
    num: z.number().positive().int().max(31),
    period: z.enum(reminderPeriod),
  })
  .refine(
    (data) => {
      if (data.num > maxValues[data.period]) {
        return false;
      }
      return true;
    },
    {
      message: "Validation error in reminder schema",
    },
  );

export type NewReminder = z.infer<typeof reminderSchema>;

export const defaultReminder: z.infer<typeof reminderSchema> = {
  num: 1,
  period: "weeks",
};
