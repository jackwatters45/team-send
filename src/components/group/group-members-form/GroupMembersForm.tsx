import { Form } from "@/components/ui/form";
import GroupMembersFormContent from "./GroupMembersFormContent";
import {
  type GroupMembersFormType,
  groupMembersFormSchema,
} from "./groupMembersSchema";
import { toast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import createContact from "@/lib/createContact";

interface IGroupMembersFormProps {
  group: GroupMembersFormType;
}

export default function GroupMembersForm({ group }: IGroupMembersFormProps) {
  const form = useForm<GroupMembersFormType>({
    resolver: zodResolver(groupMembersFormSchema),
    defaultValues: {
      name: group.name ?? "",
      description: group.description ?? "",
      avatar: group.avatar ?? "",
      members: group.members.map(createContact) ?? [createContact()],
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-6"
      >
        <GroupMembersFormContent
          title={"Edit Members"}
          form={form}
          submitText={"Save"}
        />
      </form>
    </Form>
  );
}
