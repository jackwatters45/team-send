import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useEffect } from "react";

import { api } from "@/utils/api";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";

import { GroupLayout } from "@/layouts/GroupLayout";
import { Form, FormDescription } from "@/components/ui/form";
import { MessageSettings } from "@/components/group/MessageSettings";
import { Button } from "@/components/ui/button";
import GroupMembersTable from "@/components/group/GroupMembersTable";
import { toast } from "@/components/ui/use-toast";
import { CheckboxInput, FormTextarea } from "@/components/ui/form-inputs";
import {
  type GroupMessageSchema,
  type GroupMessageType,
  defaultReminder,
  groupMessageSchema,
} from "@/components/group/groupMessageSchema";
import { getServerAuthSession } from "@/server/auth";
import { getInitialSelectedMembers } from "@/lib/utils";
import useDataTable from "@/hooks/useDataTable";
import { groupMembersColumns } from "@/components/group/groupMembersColumns";

// TODO
export default function Group({
  groupId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data } = api.group.getGroupById.useQuery({ groupId });

  const { table, rowSelection } = useDataTable({
    columns: groupMembersColumns,
    data: data?.members ?? [],
    getRowId: (row) => row.contact?.id,
    enableRowSelection: (row) =>
      !!row.original.contact.phone || !!row.original.contact.email,
    options: {
      rowSelection: { initial: getInitialSelectedMembers(data?.members ?? []) },
      sorting: { initial: [{ id: "id", desc: true }] },
    },
  });

  const form = useForm<GroupMessageType>({
    resolver: zodResolver(groupMessageSchema),
    defaultValues: {
      content: "",
      isDraft: "no",
      isScheduled: "no",
      scheduledDate: undefined,
      isRecurring: "no",
      recurringNum: 1,
      recurringPeriod: "months",
      isReminders: "yes",
      reminders: [defaultReminder],
      saveRecipientState: true,
      recipients: getInitialSelectedMembers(data?.members ?? []),
    },
  });

  useEffect(() => {
    if (!rowSelection || !form) return;
    form.setValue("recipients", rowSelection);
  }, [rowSelection, form]);

  // add from edit message
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

  if (!data) {
    return <div>404</div>;
  }

  return (
    <GroupLayout group={data}>
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
            description="This message will be sent to all selected group members"
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
                checkboxes below
              </p>
            </div>
            <CheckboxInput<GroupMessageSchema>
              name="saveRecipientState"
              label="Save recipient state for group"
              description="Recipients you choose for this message will become the new default for this group"
              control={form.control}
            />
            <GroupMembersTable table={table} />
          </div>
        </form>
      </Form>
    </GroupLayout>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext<{ groupId: string }>,
) => {
  const session = await getServerAuthSession(context);
  if (!session) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  const groupId = context.params?.groupId;
  if (typeof groupId !== "string") {
    throw new Error("Invalid slug");
  }

  const helpers = genSSRHelpers(session);
  await helpers.group.getGroupById.prefetch({ groupId });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      groupId,
    },
  };
};
