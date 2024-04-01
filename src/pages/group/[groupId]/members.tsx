import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createContact } from "@/lib/utils";
import { api } from "@/utils/api";
import { getServerAuthSession } from "@/server/auth";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";
import {
  type GroupMembersFormType,
  groupMembersFormSchema,
} from "@/lib/schemas/groupMembersFormSchema";

import { toast } from "@/components/ui/use-toast";
import { GroupLayout } from "@/layouts/GroupLayout";
import { Form } from "@/components/ui/form";
import GroupMembersFormContent from "@/components/group/GroupMembersForm";

export default function GroupMembers({
  groupId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data } = api.group.getGroupById.useQuery({ groupId });

  const form = useForm<GroupMembersFormType>({
    resolver: zodResolver(groupMembersFormSchema),
    defaultValues: {
      groupId,
      members: data?.members ?? [createContact()],
      addedGroupIds: data?.addedGroupIds ?? [],
    },
  });
  
  const { mutate } = api.group.updateMembers.useMutation({
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors?.content;
      toast({
        title: "Failed to update members",
        description:
          errorMessage?.[0] ??
          "There was an error updating group members. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GroupMembersFormType) => mutate(data);

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

export const getServerSideProps = async (
  context: GetServerSidePropsContext<{ groupId: string }>,
) => {
  const session = await getServerAuthSession(context);
  if (!session) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  const groupId = context.params?.groupId;
  if (typeof groupId !== "string") {
    throw new Error("Invalid slug");
  }

  const helpers = genSSRHelpers(session);
  await helpers.group.getGroupById.prefetch({ groupId });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      groupId,
    },
  };
};
