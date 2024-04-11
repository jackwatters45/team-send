import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TRPCClientError } from "@trpc/client";

import { createNewMember } from "@/lib/utils";
import { api } from "@/utils/api";
import { getServerAuthSession } from "@/server/auth";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";

import { toast } from "@/components/ui/use-toast";
import { GroupLayout } from "@/layouts/GroupLayout";
import { Form } from "@/components/ui/form";
import GroupMembersFormContent from "@/components/group/GroupMembersForm";
import { renderErrorComponent } from "@/components/error/renderErrorComponent";
import {
  type GroupMembersFormType,
  groupMembersFormSchema,
} from "@/schemas/groupSchema";

export default function GroupMembers({
  groupId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data, error } = api.group.getGroupById.useQuery({ groupId });

  const form = useForm<GroupMembersFormType>({
    resolver: zodResolver(groupMembersFormSchema),
    defaultValues: {
      members: data?.members ?? [createNewMember()],
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
          error.message ??
          "There was an error updating group members. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GroupMembersFormType) => mutate({ groupId, ...data });

  if (!data) return renderErrorComponent(error);

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
    return { redirect: { destination: "/login", permanent: false } };
  }

  const groupId = context.params?.groupId;
  if (typeof groupId !== "string") throw new TRPCClientError("Invalid slug");

  const helpers = genSSRHelpers(session);
  await helpers.group.getGroupById.prefetch({ groupId });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      groupId,
    },
  };
};
