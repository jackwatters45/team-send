import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type RowSelectionState } from "@tanstack/react-table";
import type {
  Message,
  Prisma,
  PrismaClient,
  ReminderPeriod,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";

import type {
  MemberSnapshotWithContact,
  MemberWithContact,
  NewMember,
} from "@/server/api/routers/member";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractInitials(text?: string, numInitials = 2): string {
  if (!text) {
    return "";
  }

  const words = text
    .replace(/[^a-zA-Z\s]+/g, "")
    .trim()
    .split(/\s+/);

  if (words.length === 1) {
    return words[0]!.slice(0, numInitials).toUpperCase();
  }

  return words
    .slice(0, numInitials)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}

export function getInitialSelectedMembers(groupMembers: MemberWithContact[]) {
  return Object.fromEntries(
    groupMembers?.map((member) => {
      const isSelected =
        member.isRecipient &&
        (!!member.contact?.phone || !!member.contact?.email);

      return [member.id, isSelected];
    }) ?? [],
  ) as RowSelectionState;
}

export function getInitialSelectedMembersSnapshot(
  groupMemberSnapshots: MemberSnapshotWithContact[],
) {
  return Object.fromEntries(
    groupMemberSnapshots?.map((snapshot) => {
      const isSelected =
        snapshot.isRecipient &&
        (!!snapshot.member.contact?.phone || !!snapshot.member.contact?.email);

      return [snapshot.id, isSelected];
    }) ?? [],
  ) as RowSelectionState;
}

export const createNewMember = (newMember?: Partial<NewMember>): NewMember => ({
  contact: {
    name: newMember?.contact?.name ?? "",
    email: newMember?.contact?.email ?? undefined,
    phone: newMember?.contact?.phone ?? undefined,
    notes: newMember?.contact?.notes ?? "",
    id: newMember?.contact?.id ?? undefined,
  },
  memberNotes: newMember?.memberNotes ?? "",
  isRecipient: newMember?.isRecipient ?? true,
  id: undefined,
});

export function formatRelativeDateAndTime(
  dateInput: string | Date | undefined,
): { date: string; time: string } | undefined {
  if (!dateInput) {
    return undefined;
  }

  const now = new Date();
  const date = new Date(dateInput);

  const diff = now.getTime() - date.getTime();

  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  let currentDate: string;
  if (diffDays === 0) {
    currentDate = "Today";
  } else if (diffDays === 1) {
    currentDate = "Yesterday";
  } else if (diffDays < 7 && diffDays > 1) {
    currentDate = date.toLocaleDateString("en-US", { weekday: "long" });
  } else {
    currentDate =
      date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }) + " at";
  }

  const time = date.toLocaleTimeString([], {
    hour12: false,
    hour: "numeric",
    minute: "2-digit",
  });

  return { date: currentDate, time };
}

export function formatShortRelativeDate(dateInput: string | Date): string {
  const today = new Date();
  const date = new Date(dateInput);

  let formattedDate: string;
  const oneDay = 24 * 60 * 60 * 1000;
  const daysDifference = Math.floor(
    (today.getTime() - date.getTime()) / oneDay,
  );

  if (daysDifference < 1 && today.getDate() === date.getDate()) {
    formattedDate = date.toLocaleTimeString([], {
      hour12: false,
      hour: "numeric",
      minute: "2-digit",
    });
  } else if (daysDifference < 7 && today.getDay() !== date.getDay()) {
    formattedDate = date.toLocaleDateString([], { weekday: "long" });
  } else {
    formattedDate = date.toLocaleDateString([], {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
  }

  return formattedDate;
}

export function truncateText(value: string, truncLength = 20) {
  return value.length > truncLength
    ? `${value.slice(0, truncLength)}...`
    : value;
}

export function camelCaseToSentenceCase(input: string): string {
  const result = input.replace(/([A-Z])/g, " $1").toLowerCase();

  return result.charAt(0).toUpperCase() + result.slice(1);
}

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export function getPeriodMillis(
  period: Message["recurringPeriod"] | ReminderPeriod,
) {
  switch (period) {
    case "years":
      return 365.25 * 24 * 60 * 60 * 1000;
    case "months":
      return 30.44 * 24 * 60 * 60 * 1000;
    case "weeks":
      return 7 * 24 * 60 * 60 * 1000;
    case "days":
      return 24 * 60 * 60 * 1000;
    case "hours":
      return 60 * 60 * 1000;
    case "minutes":
      return 60 * 1000;
    default:
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid period",
      });
  }
}

export const getFormattedIsoString = (date: Date): string => {
  return date.toISOString().slice(0, 16);
};

export const nextDayNoonUTCString = (): string => {
  const today = new Date();
  const nextDay = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() + 1,
      12,
      0,
      0,
    ),
  );

  return getFormattedIsoString(nextDay);
};

export const utcToLocalDateTimeString = (date?: Date | null): string => {
  if (!date) return nextDayNoonUTCString();

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return getFormattedIsoString(localDate);
};

export const getDelayInSec = (date: Date) =>
  (date.getTime() - Date.now()) / 1000;

export function getMessageKey(messageId: string, reminderId?: string) {
  return reminderId
    ? `message-${messageId}-reminder-${reminderId}`
    : `message-${messageId}`;
}

export async function getUserConfig(
  userId: string,
  db: PrismaClient | Prisma.TransactionClient,
) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      emailConfig: true,
      smsConfig: true,
      groupMeConfig: true,
    },
  });

  if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

  return user;
}
