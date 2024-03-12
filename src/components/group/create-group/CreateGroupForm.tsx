"use client";

import { Form } from "../../ui/form";
import CreateGroupBasicForm from "./CreateGroupBasicInfo";
import useCreateGroupForm from "./useCreateGroupForm";
import GroupMembersFormContent from "@/components/group/group-members-form/GroupMembersFormContent";

export default function CreateGroupForm() {
  const { form, onSubmit } = useCreateGroupForm();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <CreateGroupBasicForm form={form} />
        <section className="flex flex-col gap-6 pt-16">
          <GroupMembersFormContent
            title={"Add Members"}
            form={form}
            submitText={"Create Group"}
          />
        </section>
      </form>
    </Form>
  );
}
