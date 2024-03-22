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
import type { MemberBaseContact } from "@/server/api/routers/contact";
import { api } from "@/utils/api";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import type { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";
import type { IReminder, RecurPeriod } from "@/server/api/routers/message";

// TODO I don't love this, but it works for now
export default function EditMessage({
  messageId,
  groupId,
}: MessageDetailsProps) {
  const { data } = api.group.getGroupById.useQuery({ groupId });

  const { table, rowSelection, setRowSelection } = useDataTable({
    columns: getGroupMembersColumns(),
    data: data?.members ?? [],
    getRowId: (row: MemberBaseContact) => row.contact.id,
    enableRowSelection: (row) =>
      !!row.original.contact.phone || !!row.original.contact.email,
  });

  const { data: msgData } = api.message.getMessageById.useQuery({
    messageId,
  });

  useEffect(() => {
    if (!msgData) return;
    setRowSelection(getInitialSelectedMembers(msgData?.recipients ?? []));
  }, [msgData, setRowSelection]);

  const form = useForm<GroupMessageType>({
    resolver: zodResolver(groupMessageSchema),
    defaultValues: {
      content: msgData?.content,
      isScheduled: msgData?.scheduledDate ? "yes" : "no",
      scheduledDate: msgData?.scheduledDate
        ? new Date(msgData.scheduledDate)
        : undefined,
      isRecurring: msgData?.recurringNum ? "yes" : "no",
      recurringNum: msgData?.recurringNum,
      recurringPeriod: msgData?.recurringPeriod as RecurPeriod,
      isReminders: msgData?.reminders?.length ? "yes" : "no",
      reminders: (msgData?.reminders ?? []) as IReminder[],
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

  if (!msgData) {
    return null;
  }

  return (
    <PageLayout
      title={`Edit Message ${messageId}`}
      description={"Modify message content, schedule, and recipients."}
    >
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
                recipients by selecting or deselecting users using the
                checkboxes below.
              </p>
            </div>
            <CheckboxInput<GroupMessageSchema>
              name="recipientsOnlyThisMessage"
              label="Save recipient state for group"
              description="Recipients you choose for this message will become the new default for this group."
              control={form.control}
            />
            <GroupMembersTable table={table} />
          </div>
        </form>
      </Form>
    </PageLayout>
  );
}

export const getStaticProps = async (
  context: GetStaticPropsContext<{ messageId: string; groupId: string }>,
) => {
  const helpers = genSSRHelpers();

  const messageId = context.params?.messageId;
  const groupId = context.params?.groupId;

  if (typeof messageId !== "string" || typeof groupId !== "string") {
    throw new Error("Invalid slug");
  }

  await helpers.message.getMessageById.prefetch({ messageId });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      messageId,
      groupId,
    },
  };
};

export const getStaticPaths = () => ({
  paths: [],
  fallback: "blocking",
});

type MessageDetailsProps = InferGetStaticPropsType<typeof getStaticProps>;
