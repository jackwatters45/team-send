import GroupMembersTable from "@/components/group/group-members-table/GroupMembersTable";
import { getGroupMembersColumns } from "@/components/group/group-members-table/groupMembersColumns";
import { MessageSettings } from "@/components/group/group-send-message/MessageSettings";
import {
  groupMessageSchema,
  type GroupMessageSchema,
  type GroupMessageType,
} from "@/components/group/group-send-message/groupMessageSchema";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CheckboxInput, FormTextarea } from "@/components/ui/form-inputs";
import { toast } from "@/components/ui/use-toast";
import useDataTable from "@/hooks/useDataTable";
import PageLayout from "@/layouts/PageLayout";
import getInitialSelectedMembers from "@/lib/getInitialSelectedMembers";
import type { IContact } from "@/server/api/routers/contact";
import { type IMessage } from "@/server/api/routers/message";
import { api } from "@/utils/api";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { RowSelectionState, Table } from "@tanstack/react-table";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface EditMessageFormProps {
  messageData: IMessage;
  table: Table<IContact>;
  rowSelection: RowSelectionState;
}

function EditMessageForm({
  messageData,
  table,
  rowSelection,
}: EditMessageFormProps) {
  const form = useForm<GroupMessageType>({
    resolver: zodResolver(groupMessageSchema),
    defaultValues: {
      content: messageData?.content,
      isScheduled: messageData?.scheduledDate ? "yes" : "no",
      scheduledDate: messageData?.scheduledDate
        ? new Date(messageData.scheduledDate)
        : undefined,
      isRecurring: messageData?.recurringNum ? "yes" : "no",
      recurringNum: messageData?.recurringNum ?? undefined,
      recurringPeriod: messageData?.recurringPeriod ?? undefined,
      isReminders: messageData?.reminders?.length ? "yes" : "no",
      reminders: messageData?.reminders ?? [],
      recipientsOnlyThisMessage: true,
      selectedMembers: rowSelection ?? {},
    },
  });

  useEffect(() => {
    if (!rowSelection || !form) return;
    form.setValue("selectedMembers", rowSelection);
  }, [rowSelection, form]);

  const onSubmit = (data: GroupMessageType) => {
    if (data.isReminders === "yes" && data.reminders?.length === 0) {
      form.setValue("isReminders", "no");
    }

    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  };

  const [parent] = useAutoAnimate();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-8 sm:gap-6"
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
        <div>
          <div>
            <h3 className="text-medium text-lg">Message Recipients</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Selected users will receive this message. You can change
              recipients by selecting or deselecting users using the checkboxes
              below.
            </p>
          </div>
          <CheckboxInput<GroupMessageSchema>
            name="recipientsOnlyThisMessage"
            label="Save recipient state for group"
            description="Recipients you choose for this message will become the new default for this group."
            control={form.control}
          />
          <GroupMembersTable table={table} isLoading={!messageData} />
        </div>
      </form>
    </Form>
  );
}

export default function EditMessage() {
  const router = useRouter();

  const groupId = useRouter().query.groupId as string;
  const { data: groupMembers } = api.group.getGroupMembers.useQuery(groupId);

  const { table, rowSelection, setRowSelection } = useDataTable({
    columns: getGroupMembersColumns(),
    data: groupMembers ?? [],
    getRowId: (row: IContact) => row.id,
    enableRowSelection: (row) => !!row.original.phone || !!row.original.email,
  });

  const messageId = router.query.messageId as string;
  const { data: messageData } = api.message.getMessageData.useQuery(messageId);

  useEffect(() => {
    if (!messageData) return;
    setRowSelection(getInitialSelectedMembers(messageData?.recipients ?? []));
  }, [messageData, setRowSelection]);

  return (
    <PageLayout
      title={`Edit Message ${messageId ?? ""}`}
      description={"Modify message content, schedule, and recipients."}
    >
      {messageData ? (
        <EditMessageForm
          messageData={messageData}
          table={table}
          rowSelection={rowSelection}
        />
      ) : (
        <p>Loading...</p>
      )}
    </PageLayout>
  );
}
