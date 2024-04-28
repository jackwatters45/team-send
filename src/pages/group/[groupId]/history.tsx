import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { TRPCClientError } from "@trpc/client";
import { useRouter } from "next/router";
import type { User } from "@prisma/client";

import { api } from "@/utils/api";
import type { RouterOutputs } from "@/utils/api";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";
import useDataTable from "@/hooks/useDataTable";
import { getServerAuthSession } from "@/server/auth";
import type {
  MemberSnapshotWithContact,
  MemberWithContact,
} from "@/server/api/routers/member";

import { GroupLayout } from "@/layouts/GroupLayout";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DataTableColumnHeader,
  DataTableRowActions,
} from "@/components/ui/data-table";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  DateHoverableCell,
  HoverableCell,
  MembersHoverableCell,
  UserHoverableCell,
} from "@/components/ui/hover-card";
import {
  DataTableColumnOptions,
  DataTableContent,
  DataTableFilter,
  DataTablePagination,
  DataTableSelectedRowCount,
} from "@/components/ui/data-table";
import { toast } from "@/components/ui/use-toast";
import { ConfirmDeleteDialog } from "@/components/ui/alert-dialog";
import { renderErrorComponent } from "@/components/error/renderErrorComponent";

export default function GroupHistory({
  groupId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data, error } = api.group.getGroupHistoryById.useQuery({ groupId });

  const ctx = api.useUtils();
  const { mutate: deleteMessage } = api.message.delete.useMutation({
    onSuccess: (data) => {
      void ctx.group.getGroupHistoryById.invalidate();
      toast({
        title: "Message Deleted",
        description: `Message "${data.id}" has been deleted.`,
      });
    },
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors?.content;
      toast({
        title: "Message Delete Failed",
        description:
          errorMessage?.[0] ??
          error.message ??
          "An error occurred while deleting the message. Please try again.",
        variant: "destructive",
      });
    },
  });
  const handleDelete = (messageId: string) => {
    toast({
      title: "Deleting Message",
      description: "Please wait while we delete the message.",
    });

    deleteMessage({ messageId });
  };

  const { mutate: sendMessage } = api.message.sendDraft.useMutation({
    onSuccess: (data) => {
      void ctx.group.getGroupHistoryById.invalidate();
      toast({
        title: "Message Sent",
        description: `Message "${data?.id}" has been sent.`,
      });
    },
    onError: (error) => {
      // TODO need to offer some details on why it failed + what to do
      const errorMessage = error.data?.zodError?.fieldErrors?.content;
      toast({
        title: "Retry Send Message Failed",
        description:
          errorMessage?.[0] ??
          error.message ??
          "An error occurred while trying to send the message.",
        variant: "destructive",
      });
    },
  });
  const handleSend = (messageId: string) => {
    toast({
      title: "Sending Message",
      description: "Please wait while we send your message.",
    });

    sendMessage({ messageId });
  };

  const router = useRouter();
  const { mutate: duplicateMessage } = api.message.duplicate.useMutation({
    onSuccess: (data) => {
      void router.push(`/group/${data?.groupId}/message/${data?.id}/edit`);
    },
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors?.content;
      toast({
        title: "Duplicate Message Failed",
        description:
          errorMessage?.[0] ??
          error.message ??
          "An error occurred while trying to duplicate the message. Please try again.",
        variant: "destructive",
      });
    },
  });
  const handleDuplicate = (messageId: string) => {
    toast({
      title: "Duplicating Message",
      description: "Please wait while we duplicate your message.",
    });

    duplicateMessage({ messageId });
  };

  const historyTableColumns = getHistoryTableColumns({
    groupId,
    handleDelete,
    handleSend,
    handleDuplicate,
  });
  const { table } = useDataTable({
    columns: historyTableColumns,
    data: data?.messages ?? [],
    options: {
      columnVisibility: {
        initial: {
          id: false,
          sentBy: false,
          scheduled: false,
          recurring: false,
          reminders: false,
        },
      },
      sorting: { initial: [{ id: "sendAt", desc: true }] },
    },
  });

  if (!data) return renderErrorComponent(error);

  return (
    <GroupLayout group={data.group}>
      <div className=" overflow-x-auto">
        <div className="flex flex-col pb-4 pt-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Group History
          </h2>
          <div className="text-sm text-stone-500 dark:text-stone-400">
            View message and user history for this group.
          </div>
        </div>
        <div>
          <div className="flex items-center py-4">
            <DataTableFilter
              table={table}
              placeholder="Search history"
              field="content"
            />
            <DataTableColumnOptions table={table} />
          </div>
          <div className="rounded-md border dark:border-stone-700">
            <DataTableContent table={table} columns={historyTableColumns} />
          </div>
          <div className="flex items-center justify-between p-2">
            <DataTableSelectedRowCount table={table} />
            <DataTablePagination table={table} />
          </div>
        </div>
      </div>
    </GroupLayout>
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
  await helpers.group.getGroupHistoryById.prefetch({ groupId });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      groupId,
    },
  };
};

function getHistoryTableColumns({
  groupId,
  handleDelete,
  handleSend,
  handleDuplicate,
}: {
  groupId: string;
  handleDelete: (messageId: string) => void;
  handleSend: (messageId: string) => void;
  handleDuplicate: (messageId: string) => void;
}): ColumnDef<
  RouterOutputs["group"]["getGroupHistoryById"]["messages"][number]
>[] {
  return [
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
          name="select-all-rows"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          name="select-row"
        />
      ),
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
      accessorKey: "content",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Content" />
      ),
      cell: ({ row }) => {
        return <HoverableCell value={row.getValue<string>("content")} />;
      },
    },
    {
      accessorKey: "recipients",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Recipients" />
      ),
      cell: ({ row }) => {
        const members = row
          .getValue<MemberSnapshotWithContact[]>("recipients")
          .filter(({ isRecipient }) => isRecipient)
          .map(({ member, isRecipient }) => ({
            ...member,
            isRecipient,
          })) as MemberWithContact[];

        return <MembersHoverableCell members={members} />;
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue<string>("status");
        return status?.[0]?.toUpperCase() + status?.slice(1);
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const type = row.getValue<string>("type");
        return type?.[0]?.toUpperCase() + type?.slice(1);
      },
    },
    {
      accessorKey: "sendAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Send Time" />
      ),
      // cell: ({ row }) => {
      //   return <DateHoverableCell dateInput={row.original.sendAt} />;
      // },
    },
    {
      accessorKey: "sentBy",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sent By" />
      ),
      cell: ({ row }) => {
        return <UserHoverableCell user={row.getValue<User>("sentBy")} />;
      },
    },
    {
      accessorKey: "isScheduled",
      id: "scheduled",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Scheduled" />
      ),
      cell: ({ row }) => {
        return row.getValue<boolean>("scheduled") ? "Yes" : "No";
      },
    },
    {
      accessorKey: "isRecurring",
      id: "recurring",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Recurring" />
      ),
      cell: ({ row }) => {
        return row.getValue<boolean>("recurring") ? "Yes" : "No";
      },
    },
    {
      accessorKey: "isReminders",
      id: "reminders",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Reminders" />
      ),
      cell: ({ row }) => {
        return row.getValue<boolean>("reminders") ? "Yes" : "No";
      },
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <DataTableRowActions>
            <DropdownMenuItem
              onClick={async () => {
                void navigator.clipboard.writeText(row.getValue<string>("id"));

                toast({
                  title: "Message ID copied",
                  description: `message ID "${row.getValue<string>("id")}" has been copied to your clipboard.`,
                });
              }}
            >
              Copy message ID
              {/* <DropdownMenuShortcut>⌘C</DropdownMenuShortcut> */}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                href={`/group/${groupId}/message/${row.getValue<string>("id")}`}
                className="w-48"
              >
                View message details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDuplicate(row.getValue("id"))}
            >
              Duplicate message
              {/* <DropdownMenuShortcut>⌘D</DropdownMenuShortcut> */}
            </DropdownMenuItem>
            {row.getValue<string>("status") !== "sent" && (
              <DropdownMenuItem>
                <Link
                  href={`/group/${groupId}/message/${row.getValue<string>("id")}/edit`}
                  className="w-48"
                >
                  Edit message
                </Link>
              </DropdownMenuItem>
            )}
            {row.getValue<string>("status") === "failed" &&
              !row.getValue<string>("hasRetried") && (
                <DropdownMenuItem
                  onClick={() => handleSend(row.getValue("id"))}
                >
                  Retry send message
                </DropdownMenuItem>
              )}
            {row.getValue<string>("status") === "draft" && (
              <DropdownMenuItem onClick={() => handleSend(row.getValue("id"))}>
                Send message
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {row.getValue<string>("status") === "pending" && (
              <DropdownMenuItem onClick={() => handleSend(row.getValue("id"))}>
                Send message now
              </DropdownMenuItem>
            )}
            <ConfirmDeleteDialog
              onConfirm={() => handleDelete(row.getValue("id"))}
              triggerText="Delete message"
              dialogDescription="This cannot be undone and will permanently delete the message."
            />
          </DataTableRowActions>
        );
      },
    },
  ];
}
