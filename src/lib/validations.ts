import type { Message } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import debug from "debug";
const log = debug("team-send:lib:validations");

import type {
  MessageFormType,
  MessageInputType,
} from "@/schemas/messageSchema";

export function validateScheduleDate(scheduledDate: Date | null) {
  if (!scheduledDate) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Scheduled date is required",
    });
  }

  const now = new Date();
  if (scheduledDate.getTime() < now.getTime()) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Scheduled date must be in the future",
    });
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

  const maxValues = {
    days: 31,
    weeks: 4,
    months: 12,
    years: 1,
  } as const;

  if (recurringNum > maxValues[recurringPeriod as keyof typeof maxValues]) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Recurring number for ${recurringPeriod} must be less than ${maxValues[recurringPeriod as keyof typeof maxValues] + 1} and greater than 0`,
    });
  }

  return { recurringNum, recurringPeriod };
}

export function validateMessageForm(
  formData: MessageFormType,
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

  if (formData.isScheduled === "yes") {
    formData.status = "scheduled";
  }

  return {
    ...formData,
    status: formData.status,
    scheduledDate: formData.scheduledDate
      ? new Date(formData.scheduledDate)
      : null,
    isRecurring: formData.isRecurring === "yes",
    isScheduled: formData.isScheduled === "yes",
    isReminders: formData.isReminders === "yes",
  };
}

export const recurMaxValues = {
  days: 31,
  weeks: 4,
  months: 12,
  years: 1,
} as const;
