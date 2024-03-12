import { z } from "zod";

export const reminderSchema = z.object({
  num: z.number().positive().int().max(36),
  period: z.enum(["months", "weeks", "days"]),
});

export const defaultReminder: z.infer<typeof reminderSchema> = {
  num: 1,
  period: "weeks",
};

export const groupMessageSchema = z
  .object({
    message: z.string().max(500).min(1),
    isScheduled: z.enum(["no", "yes"]),
    scheduledDate: z.date().optional(),
    isRecurring: z.enum(["no", "yes"]),
    recurringNum: z.number().positive().int().max(36).optional(),
    recurringPeriod: z.enum(["years", "months", "weeks", "days"]).optional(),
    isReminders: z.enum(["no", "yes"]),
    reminders: z.array(reminderSchema).max(6).optional(),
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
