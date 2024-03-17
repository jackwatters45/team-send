import { MinusCircledIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { UseFormReturn } from "react-hook-form";

import { Button } from "../../ui/button";
import { FormInput } from "../../ui/form-inputs";
import { FormControl, FormField, FormItem, FormLabel } from "../../ui/form";
import createContact from "@/lib/createContact";
import type {
  GroupMembersFormType,
  GroupMembersFormSchema,
} from "./groupMembersSchema";
import { Checkbox } from "@/components/ui/checkbox";

interface IGroupMemberListProps {
  form: UseFormReturn<GroupMembersFormType>;
}

export default function GroupMemberList({ form }: IGroupMemberListProps) {
  const [parent] = useAutoAnimate();

  return (
    <div className="flex flex-col gap-2 py-2" ref={parent}>
      {form.watch("members")?.map((_, index) => (
        <div key={index} className="flex gap-2">
          <div className="flex flex-1 flex-wrap items-start gap-2">
            <FormField
              control={form.control}
              name={`members.${index}.isRecipient`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex h-10 cursor-pointer rounded-md border border-stone-200 bg-white px-3 py-2 text-sm dark:border-stone-800 dark:bg-stone-900">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormLabel>
                </FormItem>
              )}
            />
            <FormInput<GroupMembersFormSchema>
              control={form.control}
              name={`members.${index}.name`}
              placeholder="Name"
            />
            <FormInput<GroupMembersFormSchema>
              control={form.control}
              name={`members.${index}.email`}
              type="email"
              required={false}
              placeholder="Email"
            />
            <FormInput<GroupMembersFormSchema>
              control={form.control}
              name={`members.${index}.phone`}
              type="tel"
              placeholder="Phone"
            />
            <div className="lg:flex-1">
              <FormInput<GroupMembersFormSchema>
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
              onClick={() => {
                form.setValue(
                  "members",
                  form.getValues("members").filter((_, i) => i !== index),
                );
              }}
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
        onClick={() => {
          form.setValue("members", [
            ...form.getValues("members"),
            createContact(),
          ]);
        }}
      >
        <PlusCircledIcon className="h-5 w-5" />
        Add New
      </Button>
    </div>
  );
}
