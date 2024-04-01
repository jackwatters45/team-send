import { GroupLayout } from "@/layouts/GroupLayout";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";
import { api } from "@/utils/api";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import type { Control, FieldValues, Path } from "react-hook-form";

import { getServerAuthSession } from "@/server/auth";
import { extractInitials } from "@/lib/utils";

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
import { Separator } from "@/components/ui/separator";

const groupSettingsSchema = z.object({
  groupId: z.string(),
  name: z.string().max(40),
  description: z.string().max(100).optional(),
  image: z.string().optional(),
  "image-file": z.string().optional(),
  usePhone: z.boolean(),
  useEmail: z.boolean(),
  "change-global": z.boolean(),
});
type GroupSettingsFormType = z.infer<typeof groupSettingsSchema>;
type GroupSettingsFormSchema = typeof groupSettingsSchema;

export default function GroupSettings({
  groupId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data } = api.group.getGroupById.useQuery({ groupId });

  const form = useForm<GroupSettingsFormType>({
    resolver: zodResolver(groupSettingsSchema),
    defaultValues: {
      groupId: data?.id ?? "",
      name: data?.name ?? "",
      description: data?.description ?? "",
      image: data?.image ?? undefined,
      "image-file": "",
      usePhone: data?.usePhone ?? false,
      useEmail: data?.useEmail ?? false,
      "change-global": false,
    },
  });

  const ctx = api.useUtils();
  const { mutate: updateSettings } = api.group.updateSettings.useMutation({
    onSuccess: async (data) => {
      void ctx.group.getGroupById.invalidate({ groupId: data.id });
      toast({
        title: "Group Settings Updated",
        description: `Group "${data.id}" settings have been successfully updated.`,
      });
    },
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors?.content;
      toast({
        title: "Failed to update settings",
        description:
          errorMessage?.[0] ??
          "There was an error updating group settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof groupSettingsSchema>) => {
    toast({
      title: "Updating Group Settings",
      description: "Please wait while we update the group settings.",
    });

    updateSettings(data);
  };

  const router = useRouter();
  const { mutate: archiveGroup } = api.group.archive.useMutation({
    onSuccess: async (data) => {
      await router.push(`/`); // TODO change
      toast({
        title: "Group Archived",
        description: `Group "${data.id}" has been archived.`,
      });
    },
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors?.content;
      toast({
        title: "Failed to archive group",
        description:
          errorMessage?.[0] ??
          "There was an error archiving the group. Please try again.",
        variant: "destructive",
      });
    },
  });
  const handleArchive = () => archiveGroup({ groupId });

  const { mutate: deleteGroup } = api.group.delete.useMutation({
    onSuccess: async (data) => {
      await router.push(`/`); // TODO change
      toast({
        title: "Group Deleted",
        description: `Group "${data.id}" has been deleted.`,
      });
    },
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors?.content;
      toast({
        title: "Failed to delete group",
        description:
          errorMessage?.[0] ??
          "There was an error deleting the group. Please try again.",
        variant: "destructive",
      });
    },
  });
  const handleDelete = () => deleteGroup({ groupId });

  if (!data) return null;

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
            <div className="rounded-md border p-4 dark:border-stone-800 dark:bg-stone-900/25">
              <h3 className=" text-lg font-medium tracking-tight ">
                Connections
              </h3>
              <FormDescription>
                Choose how you want to connect with members of this group. You
                will not be able to send messages when no connections are turned
                on.
              </FormDescription>
              {/* TODO dynamically show available connections */}
              <div className="flex flex-col gap-5 pt-5">
                <ConnectionSwitchInput
                  name="usePhone"
                  control={form.control}
                  label="Phone"
                  description="Send texts from your twilio number to members of this group."
                />
                <ConnectionSwitchInput
                  name="useEmail"
                  control={form.control}
                  label="Email"
                  description="Send emails via Nodemailer to members of this group."
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
          <div className="flex pt-4">
            <Button type="submit" className="flex-1">
              Save changes
            </Button>
          </div>
        </form>
      </Form>
      <div className="pt-12" />
      <Separator />
      <div className="pt-16">
        <div className="rounded-md border border-red-300/80 p-4 dark:border-red-800/80 dark:bg-stone-900/20">
          <h3 className="text-xl font-semibold ">Danger Zone</h3>
          <div className="flex flex-col gap-5 pt-4">
            {/* <DangerZoneCard
              title="Transfer ownership"
              description="Transfer ownership of this group to another account."
              buttonTitle="Transfer"
              onClick={() => console.log("TODO")}
            /> */}
            <DangerZoneCard
              title="Archive this group"
              description="Archive this group and make read-only."
              buttonTitle="Archive group"
              dialog={{
                title: "Archive group",
                description:
                  "Are you sure you want to archive this group? This will make the group read-only.",
                confirmText: "Archive",
                onConfirm: handleArchive,
              }}
            />
            <DangerZoneCard
              title="Delete this group"
              description="Deleting a group will erase all message history."
              buttonTitle="Delete group"
              dialog={{
                title: "Delete group",
                description:
                  "Are you sure you want to delete this group? This action cannot be undone.",
                confirmText: "Delete",
                onConfirm: handleDelete,
              }}
            />
          </div>
        </div>
      </div>
    </GroupLayout>
  );
}

function ConnectionSwitchInput<T extends FieldValues>({
  name,
  control,
  label,
  description,
}: {
  name: Path<T>;
  control: Control<T>;
  label: string;
  description: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex w-full flex-row items-center justify-between rounded-lg border p-4 dark:border-stone-800 dark:bg-stone-950">
          <div className="space-y-0.5">
            <FormLabel className="text-base">{label}</FormLabel>
            <FormDescription>{description}</FormDescription>
          </div>
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext<{ groupId: string }>,
) => {
  const session = await getServerAuthSession(context);
  if (!session) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  const groupId = context.params?.groupId;
  if (typeof groupId !== "string") {
    throw new Error("Invalid slug");
  }

  const helpers = genSSRHelpers(session);
  await helpers.group.getGroupById.prefetch({ groupId });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      groupId,
    },
  };
};
