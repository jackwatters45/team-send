import { useAutoAnimate } from "@formkit/auto-animate/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { MinusCircledIcon } from "@radix-ui/react-icons";

import { api } from "@/utils/api";
import type {
  GroupConnectionsFormReturn,
  groupConnectionsSchema,
} from "@/schemas/groupSchema";

import { toast } from "@/components/ui/use-toast";
import { CheckboxInput, FormInput } from "@/components/ui/form-inputs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ConnectionSwitchInput from "@/components/ui/connection-switch-input";
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

export function SMSConnections({ form }: { form: GroupConnectionsFormReturn }) {
  const [parent] = useAutoAnimate();

  return (
    <div
      className="rounded-lg border dark:border-stone-800 dark:bg-stone-950"
      ref={parent}
    >
      <ConnectionSwitchInput
        name="useSMS"
        control={form.control}
        label="SMS"
        description="Send texts from your twilio number to members of this group."
        variant="ghost"
      />
      {form.formState.dirtyFields.useSMS && (
        <>
          <div className="px-3 pb-2">
            <Separator />
          </div>
          <CheckboxInput
            name="change-global-sms"
            label="Change setting for all groups"
            description="Change the SMS setting for all your groups."
            control={form.control}
            className="pt-2"
          />
        </>
      )}
    </div>
  );
}

export function EmailConnection({
  form,
}: {
  form: GroupConnectionsFormReturn;
}) {
  const [parent] = useAutoAnimate();

  return (
    <div
      className="rounded-lg border dark:border-stone-800 dark:bg-stone-950"
      ref={parent}
    >
      <ConnectionSwitchInput
        name="useEmail"
        control={form.control}
        label="Email"
        description="Send emails via Nodemailer to members of this group."
        variant="ghost"
      />
      {form.formState.dirtyFields.useEmail && (
        <>
          <div className="px-3 pb-2">
            <Separator />
          </div>
          <CheckboxInput
            name="change-global-email"
            label="Change setting for all groups"
            description="Change the email setting for all your groups."
            control={form.control}
            className="pt-2"
          />
        </>
      )}
    </div>
  );
}

const groupMeIdFormSchema = z.object({
  groupMeIdInput: z
    .string()
    .regex(
      /^\d{8}$/,
      "GroupId must be exactly 8 digits long and consist only of numbers.",
    ),
});
type GroupMeIdForm = z.infer<typeof groupMeIdFormSchema>;

export function GroupMeConnectionNewGroup({
  form,
}: {
  form: GroupConnectionsFormReturn;
}) {
  const [parent] = useAutoAnimate();

  const groupMeIdForm = useForm<GroupMeIdForm>({
    resolver: zodResolver(groupMeIdFormSchema),
    defaultValues: { groupMeIdInput: "" },
  });

  const { mutate: checkGroupMeId } = api.group.checkGroupMeId.useMutation({
    onSuccess: async (data) => {
      if (!data) {
        toast({
          title: "GroupMe ID not found",
          description: "GroupMe ID not found. Please try a different id.",
          variant: "destructive",
        });
      } else {
        groupMeIdForm.reset();
        form.setValue("groupMeId", data.id);
        form.setValue("useGroupMe", true);
        toast({
          title: "GroupMe ID valid",
          description: `"${data.id}" is an accepted GroupMe ID.`,
        });
      }
    },
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors?.content;
      toast({
        title: "Failed to check GroupMe ID",
        description:
          errorMessage?.[0] ??
          error.message ??
          "There was an error checking the GroupMe ID. Please try again.",
        variant: "destructive",
      });
    },
  });
  const handleCheckGroupMeId = (groupMeId: string) =>
    checkGroupMeId({ groupMeId });

  return (
    <div
      className="rounded-lg border dark:border-stone-800 dark:bg-stone-950"
      ref={parent}
    >
      <ConnectionSwitchInput
        name="useGroupMe"
        control={form.control}
        label="GroupMe"
        description="Send GroupMe messages to a connected GroupMe group."
        variant="ghost"
        disabled={!form.watch("groupMeId")}
      />
      <div className="px-3 pb-2">
        <Separator />
      </div>
      <div className="px-4 pb-4">
        {form.watch("groupMeId") ? (
          <div className="space-y-3">
            <div className="pb-[1px] pt-[3px] text-sm font-medium">
              Group ID
            </div>
            <div className="flex h-10 w-full items-center rounded-md border border-stone-200 bg-white py-2 pl-3 pr-2 text-start text-sm hover:bg-white dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-900">
              <div className="flex-1">{form.watch("groupMeId")}</div>
              <Button
                type="button"
                className="h-fit p-1"
                variant={"outline"}
                onClick={() => form.resetField("groupMeId")}
              >
                <MinusCircledIcon className="h-5 w-5 text-stone-500 dark:text-stone-400" />
              </Button>
            </div>
            <div className="text-sm text-stone-500 dark:text-stone-400">
              {
                "GroupId is an 8 digit numerical value that can be found in a group's share url."
              }
            </div>
          </div>
        ) : (
          <FormField
            control={groupMeIdForm.control}
            name="groupMeIdInput"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="groupMeIdInput">Group ID</FormLabel>
                <div className="flex py-1">
                  <Input
                    {...field}
                    id="groupMeIdInput"
                    type="number"
                    placeholder="Enter the Group's ID"
                  />
                  <Button
                    type="button"
                    disabled={!groupMeIdForm.getValues("groupMeIdInput")}
                    onClick={() =>
                      handleCheckGroupMeId(
                        groupMeIdForm.getValues("groupMeIdInput"),
                      )
                    }
                  >
                    Save
                  </Button>
                </div>
                <FormDescription>
                  {
                    "GroupId is an 8 digit numerical value that can be found in a group's share url."
                  }
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {/* <FormLabel>Group ID</FormLabel>
        <div className="flex py-2">
          <Input
            type="number"
            placeholder="Enter the Group's ID"

          />
          <Button
            type="button"
            disabled={!groupMeIdForm.getValues("groupMeIdInput")}
            onClick={() =>
              handleCheckGroupMeId(groupMeIdForm.getValues("groupMeIdInput")!)
            }
          >
            Save
          </Button>
        </div>
        <FormDescription>
          GroupId is an 8 digit numerical value that can be found in a group's
          share url.
        </FormDescription>
        <FormMessage />
      </div> */}
      </div>
    </div>
  );
}

export function GroupMeConnectionExistingGroup({
  form,
  groupId,
  groupMeId,
}: {
  form: GroupConnectionsFormReturn;
  groupId: string;
  groupMeId: string | null;
}) {
  const ctx = api.useUtils();
  const { mutate: saveGroupMeId } = api.group.saveGroupMeId.useMutation({
    onSuccess: async (data) => {
      void ctx.group.getGroupSettingsById.invalidate({ groupId: data.id });
      form.reset();
      toast({
        title: "GroupMe ID saved",
        description: "GroupMe ID has been saved.",
      });
    },
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors?.content;
      toast({
        title: "Failed to save GroupMe ID",
        description:
          errorMessage?.[0] ??
          error.message ??
          "There was an error saving the GroupMe ID. Please try again.",
        variant: "destructive",
      });
    },
  });
  const handleSaveGroupMeId = (groupId: string, groupMeId?: string) => {
    if (!groupMeId) return;
    saveGroupMeId({ groupId, groupMeId });
  };

  const [parent] = useAutoAnimate();

  return (
    <div
      className="rounded-lg border dark:border-stone-800 dark:bg-stone-950"
      ref={parent}
    >
      <ConnectionSwitchInput
        name="useGroupMe"
        control={form.control}
        label="GroupMe"
        description="Send GroupMe messages to a connected GroupMe group."
        variant="ghost"
        disabled={!groupMeId}
      />
      <div className="px-3 pb-2">
        <Separator />
      </div>
      <div className="px-4 pb-4">
        <FormInput<typeof groupConnectionsSchema>
          name="groupMeId"
          label="Group ID"
          placeholder="Enter the Group's ID"
          control={form.control}
          type="number"
          description="GroupId is an 8 digit numerical 
        value that can be found in a group's share url."
        />
      </div>
      {form.formState.dirtyFields.groupMeId && (
        <div className="w-full px-4 pb-4">
          <Button
            type="button"
            className="w-full"
            disabled={!form.getValues("groupMeId")}
            onClick={() => {
              const groupMeId = form.getValues("groupMeId");
              handleSaveGroupMeId(groupId, groupMeId);
            }}
          >
            Save Group Id
          </Button>
        </div>
      )}
    </div>
  );
}
