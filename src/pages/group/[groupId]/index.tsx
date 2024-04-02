import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useEffect } from "react";
import { parsePhoneNumber } from "libphonenumber-js";
import Link from "next/link";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import type { ColumnDef } from "@tanstack/react-table";

import { api } from "@/utils/api";
import {
  type MessageFormType,
  messageFormSchema,
} from "@/lib/schemas/messageSchema";
import { defaultReminder } from "@/lib/schemas/reminderSchema.ts";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";
import { getServerAuthSession } from "@/server/auth";
import { getInitialSelectedMembers } from "@/lib/utils";
import useDataTable from "@/hooks/useDataTable";
import type { MemberBaseContact } from "@/server/api/routers/member";

import { GroupLayout } from "@/layouts/GroupLayout";
import { Form, FormDescription } from "@/components/ui/form";
import { MessageSettings } from "@/components/group/MessageSettings";
import { Button } from "@/components/ui/button";
import GroupMembersTable from "@/components/group/GroupMembersTable";
import { toast } from "@/components/ui/use-toast";
import { CheckboxInput, FormTextarea } from "@/components/ui/form-inputs";
import { Checkbox } from "@/components/ui/checkbox";
import { HoverableCell } from "@/components/ui/hover-card";
import {
  DataTableColumnHeader,
  DataTableRowActions,
} from "@/components/ui/data-table";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";

export default function Group({
  groupId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data } = api.group.getGroupById.useQuery({ groupId });

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
      toast({
        title: "Member deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  const handleDeleteMember = (memberId: string) => deleteMember({ memberId });

  const columns = getGroupMembersColumns(handleDeleteMember);
  const { table, rowSelection } = useDataTable({
    columns,
    data: data?.members ?? [],
    getRowId: (row) => row.contact?.id,
    enableRowSelection: (row) =>
      !!row.original.contact.phone || !!row.original.contact.email,
    options: {
      rowSelection: { initial: getInitialSelectedMembers(data?.members ?? []) },
      sorting: { initial: [{ id: "id", desc: true }] },
    },
  });

  const form = useForm<MessageFormType>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      content: "",
      isDraft: "no",
      isScheduled: "no",
      scheduledDate: undefined,
      isRecurring: "no",
      recurringNum: 1,
      recurringPeriod: "months",
      isReminders: "yes",
      reminders: [defaultReminder],
      saveRecipientState: true,
      recipients: getInitialSelectedMembers(data?.members ?? []),
    },
  });

  useEffect(() => {
    if (!rowSelection || !form) return;
    form.setValue("recipients", rowSelection);
  }, [rowSelection, form]);

  // add from edit message
  const onSubmit = (data: MessageFormType) => {
    if (data.isReminders === "yes" && data.reminders?.length === 0) {
      form.setValue("isReminders", "no");
    }

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
    return <div>404</div>;
  }

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
          <FormTextarea
            control={form.control}
            name="message"
            label="Message"
            description="This message will be sent to all selected group members"
            placeholder="Enter a message"
            required={true}
          />

          <Button
            type="submit"
            disabled={!form.formState.isDirty || !form.formState.isValid}
          >
            {form.watch("isScheduled") === "yes"
              ? "Schedule Message"
              : "Send Message"}
          </Button>

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

export const getGroupMembersColumns = (
  handleDeleteMember: (memberId: string) => void,
): ColumnDef<MemberBaseContact>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        name="select-all"
        disabled={table.getRowCount() === 0}
      />
    ),
    cell: ({ row }) => {
      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          name="select-row"
          disabled={!row.original.contact.phone && !row.original.contact.email}
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
      <DataTableColumnHeader column={column} title="Notes" className="flex-1" />
    ),
    cell: ({ row }) => <HoverableCell value={row.original.contact?.notes} />,
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
              title: "Member ID copied",
              description: `member ID "${row.getValue<string>("id")}" has been copied to your clipboard.`,
            });
          }}
          className="w-48"
        >
          Copy member ID
          <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <Link href={`/contact/${row.original.contact.id}`}>
          <DropdownMenuItem>View contact details</DropdownMenuItem>
        </Link>
        <DropdownMenuItem
          onClick={() => handleDeleteMember(row.getValue<string>("id"))}
        >
          Remove from group
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DataTableRowActions>
    ),
  },
];
