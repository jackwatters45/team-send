import useGroupSendMessage from "./useGroupSendMessage";
import { Button } from "../../ui/button";
import { Form, FormDescription } from "../../ui/form";
import { FormTextarea } from "../../ui/form-inputs";
import { MessageSettings } from "./MessageSettings";
import GroupMembersTable from "../group-members-table/GroupMembersTable";


export default function GroupSendMessage() {
  const { form, onSubmit, parent } = useGroupSendMessage()

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
        <MessageSettings form={form} />
        <FormTextarea
          control={form.control}
          name="message"
          label="Message"
          description="This message will be sent to all selected group members."
          placeholder="Enter a message"
          required={true}
        />
        <Button type="submit">
          {form.watch("isScheduled") === "yes"
            ? "Schedule Message"
            : "Send Message"}
        </Button>
        <div className="border-b dark:border-stone-500 dark:border-opacity-20" />
        <GroupMembersTable  />
      </form>
    </Form>
  );
}
