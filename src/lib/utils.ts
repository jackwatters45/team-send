import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type RowSelectionState } from "@tanstack/react-table";
import type { MessageFormType } from "./schemas/messageSchema";

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
    email: newMember?.contact?.email ?? "",
    phone: newMember?.contact?.phone ?? "",
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

export function validateMessageForm(formData: MessageFormType) {
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

  return {
    ...formData,
    isRecurring: formData.isRecurring === "yes",
    isScheduled: formData.isScheduled === "yes",
    isReminders: formData.isReminders === "yes",
  };
}
