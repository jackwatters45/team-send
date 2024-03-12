import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import createUser from "@/lib/createUser";
import { api } from "@/utils/api";

import { Form } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { GroupLayout } from "@/layouts/GroupLayout";

import {
  type ICreateGroupSchema,
  createGroupSchema,
} from "@/components/group/create-group/createGroupSchema";
import GroupMembersFormContent from "../../../components/group/members-form/GroupMembersFormContent";

export default function GroupMembers() {
  const group = api.group.getGroupData.useQuery();

  const form = useForm<ICreateGroupSchema>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: group.data?.name ?? "",
      description: group.data?.description ?? "",
      avatar: group.data?.avatar ?? "",
      members: group.data?.members.map(createUser) ?? [createUser()],
      recentsSearch: "",
    },
  });

  const onSubmit = (data: ICreateGroupSchema) => {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  };

  if (!group.data) {
    return null;
  }

  return (
    <GroupLayout groupData={group.data}>
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
    </GroupLayout>
  );
}
