import { MinusCircledIcon } from "@radix-ui/react-icons";

import type { groupMessageSchema } from "./groupMessageSchema";
import useGroupSendMessage from "./useGroupSendMessage";

import { Button } from "../ui/button";
import { Form, FormDescription, FormLabel } from "../ui/form";
import {
  BooleanSelect,
  DateTimeInput,
  FormTextarea,
  NumPeriodInputs,
} from "../ui/form-inputs";
import GroupMembersTable from "./group-members-table/GroupMembersTable";

export default function GroupSendMessage() {
  const { form, onSubmit, reminders, removeReminder, addReminder, parent } =
    useGroupSendMessage();

  // turn form into datatable editable?

  // members
  // add field to members -> send/not send
  // needs save button
  // to add send/not send to create??

  return (
    <Form {...form}>
      <div className="flex flex-col pb-4 pt-3">
        <h2 className="text-xl font-semibold tracking-tight">
          Send Group Message
        </h2>
        <FormDescription>
          Send a message to all selected group members.
        </FormDescription>
      </div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-8 sm:gap-6"
        ref={parent}
      >
        <BooleanSelect<typeof groupMessageSchema>
          control={form.control}
          name="isScheduled"
          label="Scheduled"
          description="Schedule messages to be sent at a specific date and time"
        />
        {form.watch("isScheduled") === "yes" && (
          <DateTimeInput<typeof groupMessageSchema>
            control={form.control}
            name="scheduledDate"
            label="Scheduled Date"
          />
        )}
        <BooleanSelect<typeof groupMessageSchema>
          control={form.control}
          name="isRecurring"
          label="Recurring"
          description="Set up automatic, recurring messages for consistent reminders"
        />
        {form.watch("isRecurring") === "yes" && (
          <div className="flex flex-col gap-3">
            <FormLabel>Recurring every</FormLabel>
            <NumPeriodInputs<typeof groupMessageSchema>
              control={form.control}
              numName="recurringNum"
              periodName="recurringPeriod"
              label="Recurring every"
              numGreaterThanOne={Number(form.watch("recurringNum")) > 1}
            />
          </div>
        )}
        <BooleanSelect<typeof groupMessageSchema>
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
                <NumPeriodInputs<typeof groupMessageSchema>
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
        <FormTextarea
          control={form.control}
          name="message"
          label="Message"
          description="This message will be sent to all selected group members."
          placeholder="Enter a message"
        />
        <Button type="submit">
          {form.watch("isScheduled") === "yes"
            ? "Schedule Message"
            : "Send Message"}
        </Button>
        <div className="border-b dark:border-stone-500 dark:border-opacity-20" />
        <GroupMembersTable />
      </form>
    </Form>
  );
}
