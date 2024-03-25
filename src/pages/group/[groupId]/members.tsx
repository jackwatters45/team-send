import { type GetStaticPropsContext, type InferGetStaticPropsType } from "next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import createContact from "@/lib/createContact";
import { api } from "@/utils/api";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";

import {
  type GroupMembersFormType,
  groupMembersFormSchema,
} from "@/components/group/group-members-form/groupMembersSchema";
import { toast } from "@/components/ui/use-toast";
import { GroupLayout } from "@/layouts/GroupLayout";
import { Form } from "@/components/ui/form";
import GroupMembersFormContent from "@/components/group/group-members-form/GroupMembersForm";

type GroupProps = InferGetStaticPropsType<typeof getStaticProps>;

export default function GroupMembers({ groupId }: GroupProps) {
  const { data } = api.group.getGroupById.useQuery({ groupId });

  const form = useForm<GroupMembersFormType>({
    resolver: zodResolver(groupMembersFormSchema),
    defaultValues: {
      name: data?.name ?? "",
      description: data?.description ?? "",
      image: data?.image ?? "",
      members: data?.members ?? [createContact()],
      addedGroupIds: data?.addedGroupIds ?? [],
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

  if (!data) {
    return null;
  }

  return (
    <GroupLayout group={data}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col gap-6"
        >
          <GroupMembersFormContent
            form={form}
            title="Edit Members"
            submitText="Save"
          />
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
