import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { type z } from "zod";
import { useParams } from "next/navigation";

import { toast } from "../../ui/use-toast";
import { defaultReminder, groupMessageSchema } from "./groupMessageSchema";
import { useDataTable } from "@/hooks/useDataTable";
import { api } from "@/utils/api";
import { getGroupMembersColumns } from "../group-members-table/groupMembersColumns";

export default function useGroupSendMessage() {
  const groupId = useParams().groupId as string;
  const groupMembers = api.group.getGroupMembers.useQuery(groupId);

  const groupMembersColumns = getGroupMembersColumns();

  const table = useDataTable({
    columns: groupMembersColumns,
    data: groupMembers.data ?? [],
    includePagination: false,
  });

  const form = useForm<z.infer<typeof groupMessageSchema>>({
    resolver: zodResolver(groupMessageSchema),
    defaultValues: {
      message: "",
      isScheduled: "no",
      scheduledDate: undefined,
      isRecurring: "no",
      recurringNum: 1,
      recurringPeriod: "months",
      isReminders: "yes",
      reminders: [defaultReminder],
    },
  });

  // TODO definitely a lot more considerations here
  const onSubmit = (data: z.infer<typeof groupMessageSchema>) => {
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
