"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "../ui/form";
import { FormInput } from "../ui/form-inputs";
import { toast } from "../ui/use-toast";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";

const formSchema = z.object({
  name: z.string().max(40),
  description: z.string().max(100).optional(),
  avatar: z.string().optional(),
});

function extractInitials(text: string): string {
  const words = text.split(/\s+/);

  if (!words[0]?.[0] || !words[1]?.[0]) {
    return "";
  } else if (words.length === 1 && words[0]) {
    return words[0].slice(0, 2);
  } else {
    return words[0][0] + words[1][0];
  }
}

function useCreateGroupForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "Blue Ballers",
      description: "",
      avatar: "",
    },
  });

  const watch = form.watch;

  const name = watch("name");
  const avatar = watch("avatar");

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  };

  return { form, onSubmit, avatar, name };
}
export default function CreateGroupForm() {
  const { form, onSubmit, avatar, name } = useCreateGroupForm();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full  flex-col gap-8 sm:gap-6"
      >
        <div className="flex flex-col-reverse items-center lg:flex-row lg:justify-between lg:gap-12">
          <div className="flex w-full  flex-col gap-8 px-4 py-4  sm:gap-6 sm:px-0 lg:max-w-lg">
            <FormInput<typeof formSchema>
              control={form.control}
              name="avatar"
              label="Group Avatar"
              type="file"
            />
            <FormInput<typeof formSchema>
              control={form.control}
              name="name"
              label="Name"
              placeholder="Enter a Group Name"
            />
            <FormInput<typeof formSchema>
              control={form.control}
              name="description"
              label="Description"
              placeholder="Enter a Group Description (optional)"
            />
          </div>
          {name && (
            <Avatar className="h-24 w-24 lg:h-48 lg:w-48">
              <AvatarImage src={avatar} alt="Group Avatar" />
              <AvatarFallback className="text-4xl font-medium lg:text-8xl">
                {extractInitials(name)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        <div>
          optional
          <div>
            add members (groups + contacts)
            <div>in your other groups</div>
            <div>other groups (copy whole thing)</div>
          </div>
        </div>
      </form>
    </Form>
  );
}
