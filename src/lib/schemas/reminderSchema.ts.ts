import { z } from "zod";

export const reminderSchema = z.object({
  id: z.string().optional(),
  num: z.number().positive().int().max(36),
  period: z.enum(["months", "weeks", "days"]),
});

export const defaultReminder: z.infer<typeof reminderSchema> = {
  num: 1,
  period: "weeks",
};
