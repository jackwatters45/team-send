import { MinusCircledIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { UseFormReturn } from "react-hook-form";

import { Button } from "../ui/button";
import { FormInput } from "../ui/form-inputs";
import { FormItem } from "../ui/form";
import createUser from "@/lib/createUser";
import type {
  ICreateGroupSchema,
  createGroupSchema,
} from "./createGroupSchema";

interface ICreateGroupAddMembersProps {
  form: UseFormReturn<ICreateGroupSchema>;
}
export default function CreateGroupAddMembers({
  form,
}: ICreateGroupAddMembersProps) {
  const [parent] = useAutoAnimate();

  const handleAddUser = () => {
    form.setValue("members", [...form.getValues("members"), createUser()]);
  };

  const handleRemoveUser = (index: number) => {
    form.setValue(
      "members",
      form.getValues("members").filter((_, i) => i !== index),
    );
  };

  return (
    <div className="flex flex-col gap-2 py-2" ref={parent}>
      {form.watch("members")?.map((user, index) => (
        <div key={index} className="flex gap-2">
          <div className="flex flex-1 flex-wrap items-start gap-2">
            <FormInput<typeof createGroupSchema>
              control={form.control}
              name={`members.${index}.name`}
              placeholder="Name"
            />
            <FormInput<typeof createGroupSchema>
              control={form.control}
              name={`members.${index}.email`}
              type="email"
              required={false}
              placeholder="Email"
            />
            <FormInput<typeof createGroupSchema>
              control={form.control}
              name={`members.${index}.phone`}
              type="tel"
              placeholder="Phone"
            />
            <div className="lg:flex-1">
              <FormInput<typeof createGroupSchema>
                control={form.control}
                name={`members.${index}.notes`}
                placeholder="Notes"
              />
            </div>
          </div>
          <FormItem>
            <Button
              variant="ghost"
              type="button"
              className="border hover:bg-stone-100
               dark:border-0 dark:hover:bg-stone-800"
              onClick={() => handleRemoveUser(index)}
            >
              <MinusCircledIcon className="h-5 w-5" />
            </Button>
          </FormItem>
        </div>
      ))}
      <Button
        type="button"
        size={"sm"}
        className="flex w-fit items-center gap-2 pl-2"
        onClick={handleAddUser}
      >
        <PlusCircledIcon className="h-5 w-5" />
        Add New
      </Button>
    </div>
  );
}
