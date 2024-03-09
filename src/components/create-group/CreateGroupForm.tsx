"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "../ui/form";
import { toast } from "../ui/use-toast";

import CreateGroupRecents from "./CreateGroupRecents";
import CreateGroupAddMembers from "./CreateGroupAddMembers";
import CreateGroupBasicForm from "./CreateGroupBasicInfo";
import CreateGroupAddMembersHeader from "./CreateGroupAddMembersHeader";
import createUser from "@/lib/createUser";
import {
  createGroupSchema,
  type ICreateGroupSchema,
} from "./createGroupSchema";

export default function CreateGroupForm() {
  const form = useForm<ICreateGroupSchema>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      avatar: "",
      members: [createUser()],
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <CreateGroupBasicForm form={form} />
        <section className="flex flex-col gap-3 pt-16">
          <CreateGroupAddMembersHeader title={"Add Members"} />
          <div className="flex flex-col gap-3">
            <CreateGroupAddMembers form={form} />
            <CreateGroupRecents form={form} />
          </div>
        </section>
      </form>
    </Form>
  );
}
