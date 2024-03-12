import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { z } from "zod";

import { toast } from "../../ui/use-toast";
import { groupSettingsSchema } from "./groupSettingsSchema";
import { useParams } from "next/navigation";
import { api } from "@/utils/api";

interface IReminder {
  num: number;
  period: "months" | "weeks" | "days";
}

const useGroupSettings = () => {
  const defaultReminder: IReminder = { num: 1, period: "weeks" };

  const groupId = useParams().groupId as string;
  const groupSettings = api.group.getGroupSettings.useQuery(groupId);

  // TODO will need to be updated once figure out schema
  const form = useForm<z.infer<typeof groupSettingsSchema>>({
    resolver: zodResolver(groupSettingsSchema),
    defaultValues: {
      name: groupSettings.data?.name ?? "",
      description: groupSettings.data?.description ?? "",
      isScheduled: "no",
      scheduledDate: undefined,
      isRecurring: "no",
      recurringNum: 1,
      recurringPeriod: "months",
      isReminders: "no",
      reminders: [defaultReminder],
    },
  });

  const onSubmit = (data: z.infer<typeof groupSettingsSchema>) => {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  };

  const reminders = form.watch("reminders") ?? [];
  const removeReminder = (index: number) => {
    if (reminders.length === 0) return;
    reminders.splice(index);
    form.setValue("reminders", reminders);
  };

  const addReminder = () => {
    if (reminders.length >= 6) return;
    const newReminders = [...reminders, defaultReminder];
    form.setValue("reminders", newReminders);
  };

  const [parent] = useAutoAnimate();

  return {
    form,
    onSubmit,
    reminders,
    removeReminder,
    addReminder,
    parent,
  };
};

export default useGroupSettings;
