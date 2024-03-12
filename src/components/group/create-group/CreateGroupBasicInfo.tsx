import type { UseFormReturn } from "react-hook-form";

import extractInitials from "@/lib/extractInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { FormInput } from "../../ui/form-inputs";
import type {
  GroupMembersFormType,
  GroupMembersFormSchema,
} from "../group-members-form/groupMembersSchema";

interface ICreateGroupBasicFormProps {
  form: UseFormReturn<GroupMembersFormType>;
}
export default function CreateGroupBasicInfo({
  form,
}: ICreateGroupBasicFormProps) {
  return (
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
  );
}
