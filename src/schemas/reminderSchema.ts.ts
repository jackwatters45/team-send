import { z } from "zod";

const reminderPeriod = ["months", "weeks", "days"] as const;

export const reminderSchema = z.object({
  id: z.string().optional(),
  num: z.number().positive().int().max(36),
  period: z.enum(reminderPeriod),
});

export type NewReminder = z.infer<typeof reminderSchema>;

export const defaultReminder: z.infer<typeof reminderSchema> = {
  num: 1,
  period: "weeks",
};
