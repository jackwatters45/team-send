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

export const groupMessageSchema = z
  .object({
    id: z.string().optional(),
    status: z.enum(["draft", "scheduled", "sent", "failed"]),
    content: z.string().max(500).min(1),
    isScheduled: z.enum(["no", "yes"]),
    scheduledDate: z.date().optional(),
    isRecurring: z.enum(["no", "yes"]),
    recurringNum: z.number().positive().int().max(36).nullish(),
    recurringPeriod: z.enum(["years", "months", "weeks", "days"]).optional(),
    isReminders: z.enum(["no", "yes"]),
    reminders: z.array(reminderSchema).max(6).optional(),
    saveRecipientState: z.boolean(),
    recipients: z.record(z.string(), z.boolean()),
  })
  .refine(
    (data) => {
      if (data.isScheduled === "yes" && data.scheduledDate === undefined) {
        return false;
      }
      if (
        data.isRecurring === "yes" &&
        (data.recurringNum === undefined || data.recurringPeriod === undefined)
      ) {
        return false;
      }
      if (
        data.isReminders === "yes" &&
        (data.reminders === undefined || data.reminders?.length === 0)
      ) {
        return false;
      }

      return true;
    },
    {
      message:
        "Required fields are missing based on the conditional selections.",
      path: ["scheduledDate", "recurringNum", "recurringPeriod", "reminders"],
    },
  );

export type GroupMessageType = z.infer<typeof groupMessageSchema>;

export type GroupMessageSchema = typeof groupMessageSchema;
