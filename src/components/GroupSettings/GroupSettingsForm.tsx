import { MinusCircledIcon } from "@radix-ui/react-icons";

import type { groupSettingsSchema } from "./groupSettingsSchema";
import useGroupSettings from "./useGroupSettings";
import { Button } from "../ui/button";
import { Form, FormDescription, FormLabel } from "../ui/form";
import {
  BooleanSelect,
  DateTimeInput,
  NumPeriodInputs,
  FormInput,
} from "../ui/form-inputs";

export default function GroupSettingsForm() {
  const { form, onSubmit, reminders, removeReminder, addReminder, parent } =
    useGroupSettings();

  return (
    <Form {...form}>
      <div className="flex flex-col pb-4 pt-3">
        <h2 className="text-xl font-semibold tracking-tight">
          Edit Group Settings
        </h2>
        <FormDescription>Make changes to group settings here.</FormDescription>
      </div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-8 sm:gap-6"
        ref={parent}
      >
        <FormInput<typeof groupSettingsSchema>
          control={form.control}
          name="name"
          label="Name"
          placeholder="Enter a Group Name"
        />
        <FormInput<typeof groupSettingsSchema>
          control={form.control}
          name="description"
          label="Description"
          placeholder="Enter a Group Description (optional)"
        />
        <BooleanSelect<typeof groupSettingsSchema>
          control={form.control}
          name="isScheduled"
          label="Scheduled"
          description="Schedule messages to be sent at a specific date and time"
        />
        {form.watch("isScheduled") === "yes" && (
          <DateTimeInput<typeof groupSettingsSchema>
            control={form.control}
            name="scheduledDate"
            label="Scheduled Date"
          />
        )}
        <BooleanSelect<typeof groupSettingsSchema>
          control={form.control}
          name="isRecurring"
          label="Recurring"
          description="Set up automatic, recurring messages for consistent reminders"
        />
        {form.watch("isRecurring") === "yes" && (
          <div className="flex flex-col gap-3">
            <FormLabel>Recurring every</FormLabel>
            <NumPeriodInputs<typeof groupSettingsSchema>
              control={form.control}
              numName="recurringNum"
              periodName="recurringPeriod"
              label="Recurring every"
              numGreaterThanOne={Number(form.watch("recurringNum")) > 1}
            />
          </div>
        )}
        <BooleanSelect<typeof groupSettingsSchema>
          control={form.control}
          name="isReminders"
          label="Reminders"
          description="Send reminders at set increments before the due date"
        />
        {form.watch("isReminders") === "yes" && (
          <div className="flex flex-col gap-3">
            <FormLabel>Remind before</FormLabel>
            {reminders.map((reminder, index) => (
              <div key={index} className="flex items-start gap-4">
                <NumPeriodInputs<typeof groupSettingsSchema>
                  control={form.control}
                  numName={`reminders.${index}.num`}
                  periodName={`reminders.${index}.period`}
                  label="Remind before"
                  numGreaterThanOne={reminder.num > 1}
                />
                <Button
                  variant="ghost"
                  type="button"
                  className="border 
                  px-2 hover:bg-stone-100
               dark:border-0 dark:hover:bg-stone-800
                  "
                  onClick={() => removeReminder(index)}
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
                onClick={addReminder}
              >
                + Add another reminder
              </Button>
            )}
          </div>
        )}
        <div>
          <Button type="submit" className="">
            Save changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
