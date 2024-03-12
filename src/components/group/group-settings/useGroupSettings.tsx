import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { z } from "zod";

import { toast } from "../../ui/use-toast";
import {
  type GroupSettingsFormType,
  groupSettingsSchema,
} from "./groupSettingsSchema";
import { type IGroupSettings } from "@/server/api/routers/group";

const useGroupSettings = (groupSettings: IGroupSettings) => {
  const form = useForm<GroupSettingsFormType>({
    resolver: zodResolver(groupSettingsSchema),
    defaultValues: {
      name: groupSettings.name ?? "",
      description: groupSettings.description ?? "",
      avatar: groupSettings.avatar ?? "",
      "avatar-file": "",
      phone: groupSettings.phone ?? false,
      email: groupSettings.email ?? false,
      "change-global": false,
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

  const [parent] = useAutoAnimate();

  return {
    form,
    onSubmit,
    parent,
  };
};

export default useGroupSettings;
