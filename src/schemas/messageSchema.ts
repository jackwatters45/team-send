import { z } from "zod";
import { reminderSchema } from "./reminderSchema.ts";
import { recurMaxValues } from "@/lib/validations";

const messageStatus = [
  "draft",
  "scheduled",
  "sent",
  "recurring",
  "failed",
] as const;

const recurPeriod = ["years", "months", "weeks", "days"] as const;

const baseMessageFormSchema = z.object({
  id: z.string().optional(),
  groupId: z.string(),
  status: z.enum(messageStatus),
  content: z.string().max(500).min(1),
  subject: z.string().max(100).nullish(),
  isScheduled: z.enum(["no", "yes"]),
  scheduledDate: z.string().nullish(),
  isRecurring: z.enum(["no", "yes"]),
  recurringNum: z.number().positive().int().max(31).nullish(),
  recurringPeriod: z.enum(recurPeriod).nullish(),
  isReminders: z.enum(["no", "yes"]),
  reminders: z.array(reminderSchema).max(3).nullish(),
  saveRecipientState: z.boolean(),
  recipients: z.record(z.string(), z.boolean()),
});

export const messageFormSchema = baseMessageFormSchema
  .refine(
    ({ isRecurring, recurringNum, recurringPeriod }) => {
      if (isRecurring === "yes" && recurringNum && recurringPeriod) {
        if (recurringNum > recurMaxValues[recurringPeriod]) return false;
      }
      return true;
    },
    ({ recurringPeriod }) => ({
      message: `For ${recurringPeriod}, the maximum allowed number is ${recurMaxValues[recurringPeriod!]}. Please enter a value less than or equal to this maximum.`,
      path: ["recurringNum", "recurringPeriod", "isRecurring"],
    }),
  )
  .refine(
    ({ isScheduled, scheduledDate }) => {
      if (isScheduled === "yes" && scheduledDate) {
        const now = new Date();
        const date = new Date(scheduledDate);

        if (date <= now) return false;

        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

        if (date > oneYearFromNow) return false;
      }
      return true;
    },
    {
      message:
        "Scheduled date must be in the future and no more than one year from today.",
      path: ["scheduledDate", "isScheduled"],
    },
  );
export type MessageFormType = z.infer<typeof messageFormSchema>;

export const messageInputSchema = baseMessageFormSchema
  .extend({
    isScheduled: z.boolean(),
    scheduledDate: z.date().nullish(),
    isRecurring: z.boolean(),
    isReminders: z.boolean(),
  })
  .refine(
    ({ isScheduled, scheduledDate }) => {
      return !(isScheduled && !scheduledDate);
    },
    {
      message: "Scheduled date is required when message is scheduled",
      path: ["scheduledDate"],
    },
  )
  .refine(
    ({ isRecurring, recurringNum, recurringPeriod }) => {
      return !(isRecurring && (!recurringNum || !recurringPeriod));
    },
    {
      message:
        "Recurring number and period are required when message is recurring",
      path: ["recurringNum", "recurringPeriod"],
    },
  )
  .refine(
    ({ isReminders, reminders }) => {
      return !(isReminders && !reminders?.length);
    },
    {
      message: "Reminders are required when reminders are enabled",
      path: ["reminders"],
    },
  )
  .refine(
    ({ isRecurring, recurringNum, recurringPeriod }) => {
      if (isRecurring && recurringNum && recurringPeriod) {
        if (recurringNum > recurMaxValues[recurringPeriod]) return false;
      }
      return true;
    },
    ({ recurringPeriod }) => ({
      message: `For ${recurringPeriod}, the maximum allowed number is ${recurMaxValues[recurringPeriod!]}. Please enter a value less than or equal to this maximum.`,
      path: ["recurringNum", "recurringPeriod", "isRecurring"],
    }),
  )
  .refine(
    ({ isScheduled, scheduledDate }) => {
      if (isScheduled && scheduledDate) {
        const now = new Date();
        const date = new Date(scheduledDate);

        if (date <= now) return false;

        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

        if (date > oneYearFromNow) return false;
      }
      return true;
    },
    {
      message:
        "Scheduled date must be in the future and no more than one year from today.",
      path: ["scheduledDate", "isScheduled"],
    },
  );
export type MessageInputType = z.infer<typeof messageInputSchema>;
