import * as z from "zod";

export const groupSettingsSchema = z
  .object({
    name: z.string().max(40),
    description: z.string().max(100).optional(),
    isScheduled: z.enum(["no", "yes"]),
    scheduledDate: z.date().optional(),
    isRecurring: z.enum(["no", "yes"]),
    recurringNum: z.number().positive().int().max(36).optional(),
    recurringPeriod: z.enum(["years", "months", "weeks", "days"]).optional(),
    isReminders: z.enum(["no", "yes"]),
    reminders: z
      .array(
        z.object({
          num: z.number().positive().int().max(36),
          period: z.enum(["months", "weeks", "days"]),
        }),
      )
      .max(6)
      .optional(),
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

