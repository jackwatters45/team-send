import type { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useEffect } from "react";

import useProtectedPage from "@/hooks/useProtectedRoute";
import { api } from "@/utils/api";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";

import { GroupLayout } from "@/layouts/GroupLayout";
import { Form, FormDescription } from "@/components/ui/form";
import { MessageSettings } from "@/components/group/group-send-message/MessageSettings";
import { Button } from "@/components/ui/button";
import GroupMembersTable from "@/components/group/group-members-table/GroupMembersTable";
import useGroupMembersTable from "@/components/group/group-members-table/useGroupMembersTable";
import { toast } from "@/components/ui/use-toast";
import { CheckboxInput, FormTextarea } from "@/components/ui/form-inputs";
import {
  type GroupMessageSchema,
  type GroupMessageType,
  defaultReminder,
  groupMessageSchema,
} from "@/components/group/group-send-message/groupMessageSchema";

export default function Group({
  groupId,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  useProtectedPage();

  const { data } = api.group.getGroupById.useQuery({ groupId });

  const { table, rowSelection } = useGroupMembersTable(data?.members);

  const form = useForm<GroupMessageType>({
    resolver: zodResolver(groupMessageSchema),
    defaultValues: {
      content: "",
      isScheduled: "no",
      scheduledDate: undefined,
      isRecurring: "no",
      recurringNum: 1,
      recurringPeriod: "months",
      isReminders: "yes",
      reminders: [defaultReminder],
      recipientsOnlyThisMessage: true,
      selectedMembers: rowSelection ?? {},
    },
  });

  useEffect(() => {
    if (!rowSelection || !form) return;
    form.setValue("selectedMembers", rowSelection);
  }, [rowSelection, form]);

  // TODO definitely a lot more considerations here
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
    </GroupLayout>
  );
}

export const getStaticProps = async (
  context: GetStaticPropsContext<{ groupId: string }>,
) => {
  const helpers = genSSRHelpers();

  const groupId = context.params?.groupId;

  if (typeof groupId !== "string") {
    throw new Error("Invalid slug");
  }

  await helpers.group.getGroupById.prefetch({ groupId });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      groupId,
    },
  };
};

export const getStaticPaths = () => ({
  paths: [],
  fallback: "blocking",
});
