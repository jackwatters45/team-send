import {
  BooleanSelect,
  DateTimeInput,
  NumPeriodInputs,
} from "@/components/ui/form-inputs";
import {
  type GroupMessageType,
  type GroupMessageSchema,
  defaultReminder,
} from "./groupMessageSchema";
import { type UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { MinusCircledIcon } from "@radix-ui/react-icons";

interface IMessageSettingsProps {
  form: UseFormReturn<GroupMessageType>;
}
export function MessageSettings({ form }: IMessageSettingsProps) {
  const reminders = form.watch("reminders") ?? [];

  return (
    <>
      <BooleanSelect<GroupMessageSchema>
        control={form.control}
        name="isScheduled"
        label="Scheduled"
        description="Schedule messages to be sent at a specific date and time"
      />
      {form.watch("isScheduled") === "yes" && (
        <DateTimeInput<GroupMessageSchema>
          control={form.control}
          name="scheduledDate"
          label="Scheduled Date"
        />
      )}
      <BooleanSelect<GroupMessageSchema>
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
          <NumPeriodInputs<GroupMessageSchema>
            control={form.control}
            numName="recurringNum"
            periodName="recurringPeriod"
            label="Recurring every"
            numGreaterThanOne={Number(form.watch("recurringNum")) > 1}
          />
        </div>
      )}
      <BooleanSelect<GroupMessageSchema>
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
            <div key={index} className="flex items-start gap-4">
              <NumPeriodInputs<GroupMessageSchema>
                control={form.control}
                numName={`reminders.${index}.num`}
                periodName={`reminders.${index}.period`}
                label={`Remind before ${index + 1}`}
                numGreaterThanOne={reminder.num > 1}
              />
              <Button
                variant="ghost"
                type="button"
                className="border px-2 hover:bg-stone-100 dark:border-0 dark:hover:bg-stone-800"
                onClick={() => {
                  if (reminders.length === 0) return;
                  reminders.splice(index);
                  form.setValue("reminders", reminders);
                }}
              >
                <MinusCircledIcon className=" h-5 w-5" />
              </Button>
            </div>
          ))}
          {reminders.length < 6 && (
            <Button
              variant="ghost"
              type="button"
              className=""
              onClick={() => {
                if (reminders.length < 4) {
                  form.setValue("reminders", [...reminders, defaultReminder]);
                }
              }}
            >
              + Add another reminder
            </Button>
          )}
        </div>
      )}
    </>
  );
}
