import type { Message } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import debug from "debug";
const log = debug("team-send:lib:validations");

import type {
  MessageFormType,
  MessageInputType,
} from "@/schemas/messageSchema";

export const recurMaxValues = {
  days: 31,
  weeks: 4,
  months: 12,
  years: 1,
} as const;

export function validateScheduleDate(scheduledDate: Date | null) {
  if (!scheduledDate) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Scheduled date is required",
    });
  }

  const now = new Date();
  if (scheduledDate.getTime() < now.getTime()) {
    return now;
  }

  return scheduledDate;
}

type RecurPeriod = Message["recurringPeriod"];
export function validateRecurringData({
  recurringNum,
  recurringPeriod,
}: {
  recurringNum: number | null;
  recurringPeriod: RecurPeriod;
}) {
  if (!recurringNum || !recurringPeriod) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Recurring number and period are required",
    });
  }

  if (recurringNum < 1) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Recurring number must be greater than 0",
    });
  }

  if (
    recurringNum >
    recurMaxValues[recurringPeriod as keyof typeof recurMaxValues]
  ) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Recurring number for ${recurringPeriod} must be less than ${recurMaxValues[recurringPeriod as keyof typeof recurMaxValues] + 1} and greater than 0`,
    });
  }

  return { recurringNum, recurringPeriod };
}

export function validateMessageForm(
  formData: MessageFormType,
  initialRecipients: Record<string, boolean>,
): MessageInputType {
  if (formData.isScheduled === "yes" && !formData.scheduledDate) {
    formData.isScheduled = "no";
  }
  if (formData.isScheduled === "no") {
    formData.scheduledDate = null;
    formData.isReminders = "no";
  }

  formData.reminders = Array.from(
    new Map(
      formData.reminders
        ?.filter((reminder) => reminder.num && reminder.period)
        .map((reminder) => [`${reminder.num}-${reminder.period}`, reminder]),
    ).values(),
  );

  if (formData.isReminders === "yes" && !formData.reminders?.length) {
    formData.isReminders = "no";
  } else if (formData.isReminders === "no") {
    formData.reminders = [];
  }

  if (
    formData.isRecurring === "yes" &&
    !(formData.recurringNum && formData.recurringPeriod)
  ) {
    formData.isRecurring = "no";
  } else if (formData.isRecurring === "no") {
    formData.recurringNum = null;
    formData.recurringPeriod = null;
  }

  formData.type = getMessageTypeFromForm(formData);

  const dirtyRecipients: Record<string, boolean> = {};

  const newRecipients = formData.recipients;
  for (const key in newRecipients) {
    if (initialRecipients?.[key] === newRecipients?.[key]) continue;
    dirtyRecipients[key] = newRecipients[key]!;
  }

  formData.recipients = dirtyRecipients;

  const formattedOtherFields = formatFormFieldsForBackend(formData);

  return { ...formData, ...formattedOtherFields };
}

// make changes for different desired format on backend
function formatFormFieldsForBackend(formData: MessageFormType) {
  // convert string to boolean
  const isRecurring = formData.isRecurring === "yes";
  const isScheduled = formData.isScheduled === "yes";
  const isReminders = formData.isReminders === "yes";

  // scheduledDate is a string in input, convert to Date
  const scheduledDate = formData.scheduledDate
    ? new Date(formData.scheduledDate)
    : null;

  return {
    isRecurring,
    isScheduled,
    isReminders,
    scheduledDate,
  };
}

function getMessageTypeFromForm(formData: MessageFormType): Message["type"] {
  if (formData.isRecurring === "yes") return "recurring";

  if (formData.isScheduled === "yes") return "scheduled";

  return "default";
}
