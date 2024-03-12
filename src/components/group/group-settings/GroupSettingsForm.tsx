import type { GroupSettingsFormSchema } from "./groupSettingsSchema";
import useGroupSettings from "./useGroupSettings";
import { Button } from "../../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "../../ui/form";
import { FormInput } from "../../ui/form-inputs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import extractInitials from "@/lib/extractInitials";
import { type IGroupSettings } from "@/server/api/routers/group";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

interface IGroupSettingsFormProps {
  group: IGroupSettings;
}

export default function GroupSettingsForm({ group }: IGroupSettingsFormProps) {
  const { form, onSubmit, parent } = useGroupSettings(group);

  return (
    <Form {...form}>
      <div className="flex flex-col pb-4 pt-3">
        <h2 className="text-xl font-semibold tracking-tight">
          Edit Group Settings
        </h2>
        <FormDescription>Make changes to group settings here.</FormDescription>
      </div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-8 py-4 sm:gap-6"
        ref={parent}
      >
        <div className="flex justify-between gap-12">
          <div className="flex-1">
            <FormInput<GroupSettingsFormSchema>
              name="avatar-file"
              label="Group Avatar"
              type="file"
              accept=".png, .jpg, .jpeg"
              className="dark:file:text-white "
              control={form.control}
            />
          </div>
          {(form.watch("name") || form.watch("avatar")) && (
            <Avatar className="h-20 w-20">
              <AvatarImage src={form.watch("avatar")} alt="Group Avatar" />
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
          <FormField
            control={form.control}
            name="change-global"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 pb-4 pt-10 ">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Change settings for all groups</FormLabel>
                  <FormDescription>
                    Change the phone and email settings for all your groups.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
        <div>
          <Button type="submit" className="">
            Save changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
