import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useEffect } from "react";

import { toast } from "../../ui/use-toast";
import {
  type GroupMessageType,
  defaultReminder,
  groupMessageSchema,
} from "./groupMessageSchema";
import useGroupMembersTable from "../group-members-table/useGroupMembersTable";

export default function useGroupSendMessage() {
  const { table, rowSelection, groupMembers } = useGroupMembersTable();

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

  return {
    table,
    groupMembers,
    form,
    onSubmit,
    parent,
  };
}
