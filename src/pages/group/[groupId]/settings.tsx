import { GroupLayout } from "@/layouts/GroupLayout";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";
import { api } from "@/utils/api";
import type { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import * as z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAutoAnimate } from "@formkit/auto-animate/react";

import extractInitials from "@/lib/extractInitials";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import DangerZoneCard from "@/components/ui/danger-zone-card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { CheckboxInput, FormInput } from "@/components/ui/form-inputs";
import { Button } from "@/components/ui/button";

const groupSettingsSchema = z.object({
  name: z.string().max(40),
  description: z.string().max(100).optional(),
  image: z.string().optional(),
  "image-file": z.string().optional(),
  phone: z.boolean(),
  email: z.boolean(),
  "change-global": z.boolean(),
});
type GroupSettingsFormType = z.infer<typeof groupSettingsSchema>;
type GroupSettingsFormSchema = typeof groupSettingsSchema;

type GroupProps = InferGetStaticPropsType<typeof getStaticProps>;
export default function GroupSettings({ groupId }: GroupProps) {
  const { data } = api.group.getGroupById.useQuery({ groupId });

  const form = useForm<GroupSettingsFormType>({
    resolver: zodResolver(groupSettingsSchema),
    defaultValues: {
      name: data?.name ?? "",
      description: data?.description ?? "",
      image: data?.image ?? "",
      "image-file": "",
      phone: data?.phone ?? false,
      email: data?.email ?? false,
      "change-global": false,
    },
  });

  const onSubmit = (data: z.infer<typeof groupSettingsSchema>) => {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  };

  const [parent] = useAutoAnimate();

  if (!data) {
    return null;
  }

  return (
    <GroupLayout group={data}>
      <Form {...form}>
        <div className="flex flex-col pb-4 pt-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Edit Group Settings
          </h2>
          <FormDescription>
            Make changes to group settings here.
          </FormDescription>
        </div>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-8 py-4 sm:gap-6"
          ref={parent}
        >
          <div className="flex justify-between gap-12">
            <div className="flex-1">
              <FormInput<GroupSettingsFormSchema>
                name="image-file"
                label="Group Avatar"
                type="file"
                accept=".png, .jpg, .jpeg"
                className="dark:file:text-white "
                control={form.control}
              />
            </div>
            {(form.watch("name") ??
              form.watch("image") ??
              form.watch("image-file")) && (
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={form.watch("image-file") ?? form.watch("image")}
                  alt="Group Avatar"
                />
                <AvatarFallback className="text-4xl font-medium ">
                  {extractInitials(form.watch("name"))}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          <FormInput<GroupSettingsFormSchema>
            control={form.control}
            name="name"
            label="Name"
            placeholder="Enter a Group Name"
          />
          <FormInput<GroupSettingsFormSchema>
            control={form.control}
            name="description"
            label="Description"
            placeholder="Enter a Group Description (optional)"
          />
          <div className="pt-8">
            <div className="rounded-md border p-4 dark:border-stone-700">
              <h3 className="border-b text-lg font-medium tracking-tight dark:border-stone-500 dark:border-opacity-20">
                Connections
              </h3>
              <div className="flex flex-col gap-6 pt-6">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-row items-center justify-between rounded-lg border p-4 dark:border-stone-800">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Phone</FormLabel>
                        <FormDescription>
                          Send texts from your twilio number to members of this
                          group.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-row items-center justify-between rounded-lg border p-4 dark:border-stone-800">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Email</FormLabel>
                        <FormDescription>
                          Send emails via Nodemailer to members of this group.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <CheckboxInput
                name="change-global"
                label="Change settings for all groups"
                description="Change the phone and email settings for all your groups."
                control={form.control}
              />
            </div>
          </div>
          <div>
            <Button type="submit" className="">
              Save changes
            </Button>
          </div>
        </form>
        <div className="pt-8">
          <div className="border-b border-red-300/80 dark:border-red-800/80">
            <h3 className="text-xl font-semibold">Danger Zone</h3>
          </div>
          <div className="pt-6">
            <div className="rounded-md border border-red-300/80 dark:border-red-800/80">
              <DangerZoneCard
                title="Transfer ownership"
                description="Transfer ownership of this group to another account."
                buttonTitle="Transfer"
                onClick={() => console.log("TODO")}
              />
              <DangerZoneCard
                title="Archive this group"
                description="Archive this group and make read-only."
                buttonTitle="Archive group"
                onClick={() => console.log("TODO")}
              />
              <DangerZoneCard
                title="Delete this group"
                description="Deleting a group will erase all message history."
                buttonTitle="Delete group"
                onClick={() => console.log("TODO")}
                isLast={true}
              />
            </div>
          </div>
        </div>
      </Form>
    </GroupLayout>
  );
}

export const getStaticProps = async (
  context: GetStaticPropsContext<{ groupId: string }>,
) => {
  const helpers = genSSRHelpers();

  const groupId = context.params?.groupId;

  if (typeof groupId !== "string") {
    throw new Error("Invalid slug");
  }

  await helpers.group.getGroupById.prefetch({ groupId });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      groupId,
    },
  };
};

export const getStaticPaths = () => ({
  paths: [],
  fallback: "blocking",
});
