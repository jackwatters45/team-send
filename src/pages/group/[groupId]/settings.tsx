import { GroupLayout } from "@/layouts/GroupLayout";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import type { Control, FieldValues, Path } from "react-hook-form";
import { TRPCClientError } from "@trpc/client";

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
import {
  type GroupSettingsFormType,
  groupSettingsSchema,
} from "@/lib/schemas/groupSettingsSchema";
import { renderErrorComponent } from "@/components/error/renderErrorComponent";

export default function GroupSettings({
  groupId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data, error } = api.group.getGroupById.useQuery({ groupId });

  const form = useForm<GroupSettingsFormType>({
    resolver: zodResolver(groupSettingsSchema),
    defaultValues: {
      groupId: data?.id ?? "",
      name: data?.name ?? "",
      description: data?.description ?? "",
      image: data?.image ?? undefined,
      imageFile: undefined,
      usePhone: data?.usePhone ?? false,
      useEmail: data?.useEmail ?? false,
      "change-global": false,
    },
  });

  const ctx = api.useUtils();
  const { mutate: updateSettings } = api.group.updateSettings.useMutation({
    onSuccess: async (data) => {
      void ctx.group.getGroupById.invalidate({ groupId: data?.id });
    },
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors?.content;
      toast({
        title: "Failed to update settings",
        description:
          errorMessage?.[0] ??
          error.message ??
          "There was an error updating group settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GroupSettingsFormType) => {
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
          error.message ??
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
          error.message ??
          "There was an error deleting the group. Please try again.",
        variant: "destructive",
      });
    },
  });
  const handleDelete = () => deleteGroup({ groupId });

  if (!data) return renderErrorComponent(error);

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
              <FormInput<typeof groupSettingsSchema>
                name="imageFile"
                label="Group Avatar"
                type="file"
                accept=".png, .jpg, .jpeg"
                className="dark:file:text-white "
                control={form.control}
              />
            </div>
            {(form.watch("name") ??
              form.watch("image") ??
              form.watch("imageFile")) && (
              <Avatar className="h-20 w-20">
                <AvatarImage
                  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                  src={form.watch("imageFile") || form.watch("image")}
                  alt="Group Avatar"
                />
                <AvatarFallback className="text-4xl font-medium ">
                  {extractInitials(form.watch("name"))}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          <FormInput<typeof groupSettingsSchema>
            control={form.control}
            name="name"
            label="Name"
            placeholder="Enter a Group Name"
          />
          <FormInput<typeof groupSettingsSchema>
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
            <Button
              type="submit"
              disabled={!form.formState.isDirty || !form.formState.isValid}
              className="flex-1"
            >
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
  if (typeof groupId !== "string") throw new TRPCClientError("Invalid slug");

  const helpers = genSSRHelpers(session);
  await helpers.group.getGroupById.prefetch({ groupId });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      groupId,
    },
  };
};
