import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import createContact from "@/lib/createContact";
import { toast } from "@/components/ui/use-toast";
import {
  type GroupMembersFormType,
  groupMembersFormSchema,
} from "../group-members-form/groupMembersSchema";

export default function useCreateGroupForm() {
  const form = useForm<GroupMembersFormType>({
    resolver: zodResolver(groupMembersFormSchema),
    defaultValues: {
      name: "",
      description: "",
      avatar: "",
      members: [createContact()],
      recentsSearch: "",
    },
  });

  const onSubmit = (data: GroupMembersFormType) => {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  };

  return {
    form,
    onSubmit,
  };
}
