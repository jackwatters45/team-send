import { type UseFormReturn, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { TRPCClientError } from "@trpc/client";
import { useState } from "react";
import Link from "next/link";
import { parsePhoneNumber } from "libphonenumber-js";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import type { ColumnDef } from "@tanstack/react-table";

import type { MemberWithContact } from "@/server/api/routers/member";
import { api } from "@/utils/api";
import {
  type MessageFormType,
  messageFormSchema,
} from "@/schemas/messageSchema";
import { defaultReminder } from "@/schemas/reminderSchema.ts";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";
import { getServerAuthSession } from "@/server/auth";
import { getInitialSelectedMembers, nextDayNoonUTCString } from "@/lib/utils";
import { validateMessageForm } from "@/lib/validations";
import useDataTable from "@/hooks/useDataTable";

import { GroupLayout } from "@/layouts/GroupLayout";
import { Form, FormDescription } from "@/components/ui/form";
import { MessageSettings } from "@/components/group/MessageSettings";
import { Button } from "@/components/ui/button";
import GroupMembersTable from "@/components/group/GroupMembersTable";
import { toast, toastWithLoading, useToast } from "@/components/ui/use-toast";
import {
  CheckboxInput,
  FormInput,
  FormTextarea,
} from "@/components/ui/form-inputs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DataTableColumnHeader,
  DataTableRowActions,
} from "@/components/ui/data-table";
import { HoverableCell } from "@/components/ui/hover-card";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { renderErrorComponent } from "@/components/error/renderErrorComponent";

export default function GroupSendMessage({
  groupId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data, error } = api.group.getGroupById.useQuery({ groupId });

  const isActiveConnections =
    data?.useSMS ?? data?.useEmail ?? data?.useGroupMe;

  const ctx = api.useUtils();
  const { mutate: deleteMember } = api.member.delete.useMutation({
    onSuccess: async (data) => {
      await ctx.group.getGroupById.invalidate({ groupId });
      toast({
        title: "Member deleted",
        description: `Member ${data?.id} has been deleted`,
      });
    },
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors?.content;
      toast({
        title: "Member deletion failed",
        description:
          errorMessage?.[0] ??
          error.message ??
          "An error occurred while deleting the member",
        variant: "destructive",
      });
    },
  });
  const handleDeleteMember = (memberId: string) => deleteMember({ memberId });

  const form = useForm<MessageFormType>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      content: "",
      groupId,
      subject: "",
      status: "pending",
      type: "default",
      isScheduled: "no",
      scheduledDate: nextDayNoonUTCString(),
      isRecurring: "no",
      recurringNum: 1,
      recurringPeriod: "months",
      isReminders: "no",
      reminders: [defaultReminder],
      saveRecipientState: false,
      recipients: getInitialSelectedMembers(data?.members ?? []),
    },
    mode: "onBlur",
  });

  const [isTableDirty, setIsTableDirty] = useState(false);
  const columns = getMemberRecipientsColumns({
    form,
    setIsTableDirty,
    handleDeleteMember,
  });
  const { table } = useDataTable({
    columns,
    data: data?.members ?? [],
    getRowId: (row) => row.id,
    enableRowSelection: (row) =>
      !!row.original.contact.phone || !!row.original.contact.email,
    options: {
      rowSelection: { initial: getInitialSelectedMembers(data?.members ?? []) },
      sorting: { initial: [{ id: "id", desc: true }] },
    },
  });

  const { dismiss } = useToast();
  const { mutate: send, isLoading: isSending } = api.message.send.useMutation({
    onSuccess: () => {
      form.reset();
      dismiss();
    },
    onError: (err) => {
      const errorMessage = err.data?.zodError?.fieldErrors?.content;

      toast({
        title: "Error creating message",
        description:
          errorMessage?.[0] ??
          err.message ??
          "An error occurred while creating the message",
      });
    },
  });

  const onSubmit = (formData: MessageFormType) => {
    const data = validateMessageForm(formData);

    const title = data.isScheduled
      ? "Scheduling Message"
      : data.status === "draft"
        ? "Saving Draft"
        : "Creating Message";

    const description = data.isScheduled
      ? "Your message is being scheduled"
      : data.status === "draft"
        ? "Your message is being saved as a draft"
        : "Your message is being created";

    toastWithLoading({
      title: title,
      description: description,
    });

    send(data);
  };

  const [parent] = useAutoAnimate();

  if (!data) return renderErrorComponent(error);

  return (
    <GroupLayout group={data}>
      <Form {...form}>
        <div className="flex flex-col pb-4 pt-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Send Group Message
          </h2>
          <FormDescription>
            Send a message to all selected group members.
          </FormDescription>
        </div>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-8 sm:gap-6"
          ref={parent}
        >
          <MessageSettings form={form} />
          <FormInput<typeof messageFormSchema>
            control={form.control}
            name="subject"
            label="Subject (optional)"
            description="Email subject - recommended if sending email"
            placeholder="Enter a subject"
          />
          <FormTextarea
            control={form.control}
            name="content"
            label="Message"
            description="This message will be sent to all selected group members"
            placeholder="Enter a message"
            required={true}
          />
          {isActiveConnections ? (
            <div className="flex justify-between">
              <Button
                type="submit"
                variant="outline"
                onClick={() => form.setValue("status", "draft")}
                disabled={
                  !(isTableDirty || form.formState.isDirty) ||
                  !form.formState.isValid ||
                  isSending
                }
              >
                Save as Draft
              </Button>
              <Button
                type="submit"
                disabled={
                  !(isTableDirty || form.formState.isDirty) ||
                  !form.formState.isValid ||
                  isSending
                }
              >
                {form.watch("isScheduled") === "yes"
                  ? "Schedule Message"
                  : "Send Message"}
              </Button>
            </div>
          ) : (
            <Link href="settings">
              <Button
                type="button"
                onClick={(e) => e.preventDefault()}
                variant={"destructive"}
                disabled={true}
                className="w-full"
              >
                You must have at least one active connection to send a message.
              </Button>
            </Link>
          )}
          <div className="border-b dark:border-stone-500 dark:border-opacity-20" />
          <div>
            <div>
              <h3 className="text-medium text-lg">Message Recipients</h3>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Selected users will receive this message. You can change
                recipients by selecting or deselecting users using the
                checkboxes below
              </p>
            </div>
            <CheckboxInput<typeof messageFormSchema>
              name="saveRecipientState"
              label="Save recipient state for group"
              description="Recipients you choose for this message will become the new default for this group"
              control={form.control}
            />
            <GroupMembersTable table={table} columns={columns} />
          </div>
        </form>
      </Form>
    </GroupLayout>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext<{ groupId: string }>,
) => {
  const session = await getServerAuthSession(context);
  if (!session) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
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

const getMemberRecipientsColumns = ({
  form,
  setIsTableDirty,
  handleDeleteMember,
}: {
  form: UseFormReturn<MessageFormType>;
  setIsTableDirty: React.Dispatch<React.SetStateAction<boolean>>;
  handleDeleteMember: (memberId: string) => void;
}): ColumnDef<MemberWithContact>[] => {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            form.setValue(
              "recipients",
              Object.keys(form.getValues("recipients")).reduce(
                (acc, key) => ({ ...acc, [key]: !!value }),
                {},
              ),
            );
            setIsTableDirty(true);
          }}
          aria-label="Select all"
          name="select-all"
          disabled={table.getRowCount() === 0}
        />
      ),
      cell: ({ row }) => {
        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
              form.setValue("recipients", {
                ...form.getValues("recipients"),
                [row.original.id]: !!value,
              });
              setIsTableDirty(true);
            }}
            aria-label="Select row"
            name="select-row"
            disabled={
              !row.original.contact.phone && !row.original.contact.email
            }
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
    },
    {
      accessorKey: "contact.name",
      id: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
    },
    {
      accessorKey: "contact.email",
      id: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
    },
    {
      accessorKey: "contact.phone",
      id: "phone",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
      cell: ({ row }) => {
        const phoneString = row.original.contact?.phone;
        if (!phoneString) return null;

        const phone = parsePhoneNumber(phoneString);
        return phone ? phone.formatNational() : phoneString;
      },
    },
    {
      accessorKey: "memberNotes",
      id: "notes",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Notes"
          className="flex-1"
        />
      ),
      cell: ({ row }) => <HoverableCell value={row.original.memberNotes} />,
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <DataTableRowActions>
          <DropdownMenuItem
            onClick={async () => {
              await navigator.clipboard.writeText(row.getValue<string>("id"));

              toast({
                title: "Copied member ID",
                description: `Member ID ${row.getValue<string>("id")} has been copied to your clipboard`,
              });
            }}
            className="w-48"
          >
            Copy member ID
            {/* <DropdownMenuShortcut>⌘C</DropdownMenuShortcut> */}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              await navigator.clipboard.writeText(row.original.contact.id);

              toast({
                title: "Copied contact ID",
                description: `Contact ID ${row.original.contact.id} has been copied to your clipboard`,
              });
            }}
            className="w-48"
          >
            Copy contact ID
            {/* <DropdownMenuShortcut>⌘C</DropdownMenuShortcut> */}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <Link href={`/contact/${row.original.contact.id}`}>
            <DropdownMenuItem>View contact details</DropdownMenuItem>
          </Link>
          <DropdownMenuItem
            onClick={() => handleDeleteMember(row.getValue<string>("id"))}
          >
            Remove from group
            {/* <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut> */}
          </DropdownMenuItem>
        </DataTableRowActions>
      ),
    },
  ];
};
