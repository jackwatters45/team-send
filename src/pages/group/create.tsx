import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";

import { getServerAuthSession } from "@/server/auth";
import { api } from "@/utils/api";
import { createNewMember, extractInitials } from "@/lib/utils";
import { createGroupSchema } from "@/schemas/groupSchema";
import type {
  CreateGroupFormType,
  GroupConnectionsFormReturn,
  GroupMembersFormReturn,
} from "@/schemas/groupSchema";

import GroupMembersFormContent from "@/components/group/GroupMembersForm";
import { toast } from "@/components/ui/use-toast";
import PageLayout from "@/layouts/PageLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FormInput } from "@/components/ui/form-inputs";
import { Form, FormDescription } from "@/components/ui/form";
import {
  EmailConnection,
  GroupMeConnectionNewGroup,
  SMSConnections,
} from "@/components/group/Connections";
import { renderErrorComponent } from "@/components/error/renderErrorComponent";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";

export default function CreateGroup() {
  const { data, error } = api.user.getCurrentUser.useQuery();
  // TODO: Add connections
  const form = useForm<CreateGroupFormType>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      image: "",
      members: [createNewMember()],
      addedGroupIds: [],
      useSMS: false,
      "change-global-sms": false,
      useEmail: false,
      "change-global-email": false,
      useGroupMe: false,
      groupMeId: "",
    },
  });

  const router = useRouter();
  const { mutate } = api.group.create.useMutation({
    onSuccess: async (data) => {
      await router.push(`/`); // TODO change
      toast({
        title: "Group Created",
        description: `Group "${data.name}" has been created.`,
      });
    },
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors?.content;
      toast({
        title: "Group Creation Failed",
        description:
          errorMessage?.[0] ??
          error.message ??
          "An error occurred while creating the group. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    toast({
      title: "Creating Group",
      description: "Please wait while we create the group.",
    });

    mutate(data);
  });

  if (!data) return renderErrorComponent(error);

  return (
    <PageLayout
      title={"Create New Group"}
      description={"Add members to your group and send them messages."}
    >
      <Form {...form}>
        <form onSubmit={onSubmit} className="flex w-full flex-col gap-16">
          <section className="flex flex-col-reverse items-center lg:flex-row lg:justify-between lg:gap-12">
            <div className="flex w-full  flex-col gap-8 px-4 py-4  sm:px-0 lg:max-w-lg">
              <FormInput<typeof createGroupSchema>
                control={form.control}
                name="image"
                label="Group Avatar"
                type="file"
                accept=".png, .jpg, .jpeg"
                className="dark:file:text-white"
              />
              <FormInput<typeof createGroupSchema>
                control={form.control}
                name="name"
                label="Name"
                placeholder="Enter a Group Name"
                required={true}
                autoComplete="off"
              />
              <FormInput<typeof createGroupSchema>
                control={form.control}
                name="description"
                label="Description"
                placeholder="Enter a Group Description (optional)"
              />
            </div>
            {(form.watch("name") || form.watch("image")) && (
              <Avatar className="h-24 w-24 lg:h-48 lg:w-48">
                <AvatarImage src={form.watch("image")} alt="Group Avatar" />
                <AvatarFallback className="text-4xl font-medium lg:text-8xl">
                  {extractInitials(form.watch("name"))}
                </AvatarFallback>
              </Avatar>
            )}
          </section>
          <section>
            <div className="rounded-md border p-4 dark:border-stone-800 dark:bg-stone-900/25">
              <h3 className=" text-lg font-medium tracking-tight ">
                Connections
              </h3>
              <FormDescription>
                Choose how you want to connect with members of this group. You
                will not be able to send messages when no connections are turned
                on.
              </FormDescription>
              <div className="flex flex-col gap-5 pt-5">
                {!!data.smsConfig && (
                  <SMSConnections
                    form={form as unknown as GroupConnectionsFormReturn}
                  />
                )}
                {!!data.emailConfig && (
                  <EmailConnection
                    form={form as unknown as GroupConnectionsFormReturn}
                  />
                )}
                {!!data.groupMeConfig && (
                  <GroupMeConnectionNewGroup
                    form={form as unknown as GroupConnectionsFormReturn}
                  />
                )}
              </div>
            </div>
          </section>
          <section className="flex flex-col gap-6">
            <GroupMembersFormContent
              title={"Add Members"}
              form={form as unknown as GroupMembersFormReturn}
              submitText={"Create Group"}
            />
          </section>
        </form>
      </Form>
    </PageLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession(context);
  if (!session) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  const helpers = genSSRHelpers(session);
  await helpers.user.getCurrentUser.prefetch();

  return { props: { trpcState: helpers.dehydrate() } };
};
