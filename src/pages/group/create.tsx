import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import createContact from "@/lib/createContact";
import { toast } from "@/components/ui/use-toast";

import { api } from "@/utils/api";

import PageLayout from "@/layouts/PageLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import extractInitials from "@/lib/extractInitials";
import { FormInput } from "@/components/ui/form-inputs";
import { Form } from "@/components/ui/form";
import {
  type GroupMembersFormSchema,
  type GroupMembersFormType,
  groupMembersFormSchema,
} from "@/components/group/group-members-form/groupMembersSchema";
import GroupMembersFormContent from "@/components/group/group-members-form/GroupMembersForm";

export default function CreateGroup() {
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

  const ctx = api.useUtils();

  const { mutate, isLoading: isCreatingGroup } = api.group.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Group Created",
        description: `Group ${data.name} has been created.`,
      });

      void ctx.group.getAll.invalidate();
    },
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors?.content;

      if (errorMessage?.[0]) {
        toast({
          title: "Group Creation Failed",
          description: errorMessage[0],
          variant: "destructive",
        });
      } else {
        toast({
          title: "Group Creation Failed",
          description:
            "An error occurred while creating the group. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  return (
    <PageLayout
      title={"Create New Group"}
      description={"Add members to your group and send them messages."}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <section className="flex flex-col-reverse items-center lg:flex-row lg:justify-between lg:gap-12">
            <div className="flex w-full  flex-col gap-8 px-4 py-4  sm:px-0 lg:max-w-lg">
              <FormInput<GroupMembersFormSchema>
                control={form.control}
                name="avatar"
                label="Group Avatar"
                type="file"
                accept=".png, .jpg, .jpeg"
                className="dark:file:text-white"
              />
              <FormInput<GroupMembersFormSchema>
                control={form.control}
                name="name"
                label="Name"
                placeholder="Enter a Group Name"
              />
              <FormInput<GroupMembersFormSchema>
                control={form.control}
                name="description"
                label="Description"
                placeholder="Enter a Group Description (optional)"
              />
            </div>
            {(form.watch("name") || form.watch("avatar")) && (
              <Avatar className="h-24 w-24 lg:h-48 lg:w-48">
                <AvatarImage src={form.watch("avatar")} alt="Group Avatar" />
                <AvatarFallback className="text-4xl font-medium lg:text-8xl">
                  {extractInitials(form.watch("name"))}
                </AvatarFallback>
              </Avatar>
            )}
          </section>
          <section className="flex flex-col gap-6 pt-16">
            <GroupMembersFormContent
              title={"Add Members"}
              form={form}
              submitText={"Create Group"}
            />
          </section>
        </form>
      </Form>
    </PageLayout>
  );
}
