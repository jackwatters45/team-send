import { z } from "zod";
import { reminderSchema } from "./reminderSchema.ts";

export const messageFormSchema = z.object({
  id: z.string().optional(),
  status: z.enum(["draft", "scheduled", "sent", "failed"]),
  isDraft: z.enum(["no", "yes"]),
  content: z.string().max(500).min(1),
  isScheduled: z.enum(["no", "yes"]),
  scheduledDate: z.date().nullish(),
  isRecurring: z.enum(["no", "yes"]),
  recurringNum: z.number().positive().int().max(36).nullish(),
  recurringPeriod: z.enum(["years", "months", "weeks", "days"]).nullish(),
  isReminders: z.enum(["no", "yes"]),
  reminders: z.array(reminderSchema).max(6).nullish(),
  saveRecipientState: z.boolean(),
  recipients: z.record(z.string(), z.boolean()),
});
export type MessageFormType = z.infer<typeof messageFormSchema>;

export const messageInputSchema = z
  .object({
    id: z.string().optional(),
    status: z.enum(["draft", "scheduled", "sent", "failed"]),
    content: z.string().max(500).min(1),
    isScheduled: z.boolean(),
    scheduledDate: z.date().nullish(),
    isRecurring: z.boolean(),
    recurringNum: z.number().positive().int().max(36).nullish(),
    recurringPeriod: z.enum(["years", "months", "weeks", "days"]).nullish(),
    isReminders: z.boolean(),
    reminders: z.array(reminderSchema).max(6).nullish(),
    saveRecipientState: z.boolean(),
    recipients: z.record(z.string(), z.boolean()),
  })
  .refine(
    (data) => {
      if (data.isScheduled && !data.scheduledDate) return false;

      if (data.isRecurring && (!data.recurringNum || !data.recurringPeriod))
        return false;

      if (data.isReminders && !data.reminders?.length) return false;

      return true;
    },
    {
      message:
        "Required fields are missing based on the conditional selections.",
      path: ["scheduledDate", "recurringNum", "recurringPeriod", "reminders"],
    },
  );
