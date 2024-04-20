import { useEffect, useState } from "react";
import type { ReminderPeriod } from "@prisma/client";
import { type UseFormReturn } from "react-hook-form";
import { MinusCircledIcon } from "@radix-ui/react-icons";

import {
  type MessageFormType,
  type messageFormSchema,
} from "@/schemas/messageSchema";
import {
  type NewReminder,
  defaultReminder,
  defaultReminderConstraints,
  reminderPeriod,
} from "@/schemas/reminderSchema.ts";
import { ms } from "@/constants/milliseconds";

import {
  BooleanSelect,
  DateTimeInput,
  NumPeriodInputs,
} from "@/components/ui/form-inputs";
import { Button } from "@/components/ui/button";

interface MessageSettingsProps {
  form: UseFormReturn<MessageFormType>;
}
export function MessageSettings({ form }: MessageSettingsProps) {
  const reminders = form.watch("reminders") ?? [];
  const scheduledDate = form.watch("scheduledDate");

  return (
    <>
      <BooleanSelect<typeof messageFormSchema>
        control={form.control}
        name="isScheduled"
        label="Scheduled"
        description="Schedule messages to be sent at a specific date and time"
      />
      {form.watch("isScheduled") === "yes" && (
        <DateTimeInput<typeof messageFormSchema>
          control={form.control}
          name="scheduledDate"
          label="Scheduled Date"
        />
      )}
      {form.watch("isScheduled") === "yes" &&
        scheduledDate &&
        new Date(scheduledDate).getTime() - Date.now() > ms.minute * 15 && (
          <>
            <BooleanSelect<typeof messageFormSchema>
              control={form.control}
              name="isReminders"
              label="Reminders"
              description="Send reminders at set increments before the due date"
            />
            {form.watch("isReminders") === "yes" && (
              <div className="flex flex-col gap-3">
                <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Remind before
                </div>
                {reminders.map((reminder, index) => (
                  <ReminderInput
                    key={index}
                    index={index}
                    form={form}
                    reminder={reminder}
                  />
                ))}
                {reminders.length < 3 && (
                  <Button
                    variant="ghost"
                    type="button"
                    className=""
                    onClick={() => {
                      if (reminders.length < 4) {
                        form.setValue("reminders", [
                          ...reminders,
                          defaultReminder,
                        ]);
                      }
                    }}
                  >
                    + Add another reminder
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      <BooleanSelect<typeof messageFormSchema>
        control={form.control}
        name="isRecurring"
        label="Recurring"
        description="Set up automatic, recurring messages for consistent reminders"
      />
      {form.watch("isRecurring") === "yes" && (
        <div className="flex flex-col gap-3">
          <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Recurring every
          </div>
          <NumPeriodInputs<typeof messageFormSchema>
            control={form.control}
            numName="recurringNum"
            periodName="recurringPeriod"
            label="Recurring every"
            numGreaterThanOne={Number(form.watch("recurringNum")) > 1}
            periodValues={["years", "months", "weeks", "days"]}
          />
        </div>
      )}
    </>
  );
}

type PeriodOptionsReturn = ReturnType<typeof getAllReminderNumMaxMin>[number];
type MaxMin = Pick<PeriodOptionsReturn, "max" | "min" | "maxLength">;

const defaultMaxMin: MaxMin = {
  max: 0,
  min: 0,
  maxLength: 0,
};

function ReminderInput({
  index,
  form,
  reminder,
}: {
  index: number;
  form: UseFormReturn<MessageFormType>;
  reminder: NewReminder;
}) {
  const reminders = form.watch("reminders") ?? [];

  const scheduledDate = form.watch("scheduledDate");

  const [maxMin, setMaxMin] = useState<MaxMin>(defaultMaxMin);
  const [periodOptions, setPeriodOptions] = useState<ReminderPeriod[]>([]);
  useEffect(() => {
    const data = getAllReminderNumMaxMin(scheduledDate);

    setPeriodOptions(data.map(({ value }) => value));

    const newMaxMin = data.find(({ value }) => value === reminder.period);
    setMaxMin(newMaxMin ?? defaultMaxMin);
  }, [scheduledDate, reminder.period]);

  useEffect(() => {
    if (reminder.num > maxMin.max && maxMin.max > 0)
      form.setValue(`reminders.${index}.num`, maxMin.max);
  }, [reminder.num, maxMin.max, index, form]);

  return (
    <div className="flex items-start gap-4">
      <NumPeriodInputs<typeof messageFormSchema>
        control={form.control}
        numName={`reminders.${index}.num`}
        periodName={`reminders.${index}.period`}
        label={`Remind before ${index + 1}`}
        numGreaterThanOne={reminder.num > 1}
        max={maxMin.max}
        min={maxMin.min}
        maxLength={2}
        periodValues={periodOptions}
      />
      <Button
        variant="outline"
        type="button"
        className="border px-3 hover:bg-stone-100 dark:border-0 dark:hover:bg-stone-800"
        onClick={() => {
          if (reminders.length === 0) return;
          reminders.splice(index);
          form.setValue("reminders", reminders);
        }}
      >
        <MinusCircledIcon className=" h-5 w-5" />
      </Button>
    </div>
  );
}

function getAllReminderNumMaxMin(
  scheduledDateString: string | null | undefined,
) {
  const scheduledDate = scheduledDateString
    ? new Date(scheduledDateString)
    : undefined;

  if (!scheduledDate) {
    throw new Error("Scheduled date is required when reminders are enabled");
  }

  const timeUntilScheduledDate = scheduledDate.getTime() - Date.now();

  const timePeriods = {
    months: Math.floor(timeUntilScheduledDate / ms.month),
    weeks: Math.floor(timeUntilScheduledDate / ms.week),
    days: Math.floor(timeUntilScheduledDate / ms.day),
    hours: Math.floor(timeUntilScheduledDate / ms.hour),
    minutes: Math.floor(timeUntilScheduledDate / ms.minute),
  };

  const periodsInfo = reminderPeriod
    .filter((period) => timePeriods[period] > 0)
    .map((period) => {
      return {
        ...defaultReminderConstraints[period],
        max: Math.min(
          timePeriods[period],
          defaultReminderConstraints[period].max,
        ),
      };
    });

  return periodsInfo;
}
