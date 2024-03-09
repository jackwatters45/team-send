import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { type z } from "zod";

import { toast } from "../ui/use-toast";
import { groupMessageSchema, type reminderSchema } from "./groupMessageSchema";

export default function useGroupSendMessage() {
  const defaultReminder: z.infer<typeof reminderSchema> = {
    num: 1,
    period: "weeks",
  };

  const form = useForm<z.infer<typeof groupMessageSchema>>({
    resolver: zodResolver(groupMessageSchema),
    defaultValues: {
      message: "",
      isScheduled: "no",
      scheduledDate: undefined,
      isRecurring: "no",
      recurringNum: 1,
      recurringPeriod: "months",
      isReminders: "no",
      reminders: [defaultReminder],
    },
  });

  const onSubmit = (data: z.infer<typeof groupMessageSchema>) => {
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
}
