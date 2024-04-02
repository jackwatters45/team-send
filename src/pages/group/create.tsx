import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";

import { getServerAuthSession } from "@/server/auth";
import { api } from "@/utils/api";
import { createContact, extractInitials } from "@/lib/utils";

import GroupMembersFormContent from "@/components/group/GroupMembersForm";
import { toast } from "@/components/ui/use-toast";
import PageLayout from "@/layouts/PageLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FormInput } from "@/components/ui/form-inputs";
import { Form } from "@/components/ui/form";
import {
  type CreateGroupFormType,
  createGroupSchema,
} from "@/lib/schemas/createGroupSchema";
import { type GroupMembersFormReturn } from "@/lib/schemas/groupMembersFormSchema";

export default function CreateGroup() {
  const form = useForm<CreateGroupFormType>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      image: "",
      members: [createContact()],
      addedGroupIds: [],
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

  return (
    <PageLayout
      title={"Create New Group"}
      description={"Add members to your group and send them messages."}
    >
      <Form {...form}>
        <form onSubmit={onSubmit} className="w-full">
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
          <section className="flex flex-col gap-6 pt-16">
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

  return { props: {} };
};
