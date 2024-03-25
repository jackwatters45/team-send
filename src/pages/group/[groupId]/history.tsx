import type { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import useProtectedPage from "@/hooks/useProtectedRoute";
import { api } from "@/utils/api";
import type { RouterOutputs } from "@/utils/api";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";
import useDataTable from "@/hooks/useDataTable";

import { GroupLayout } from "@/layouts/GroupLayout";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DataTableColumnHeader,
  DataTableRowActions,
} from "@/components/ui/data-table";
import { type User } from "@/server/api/routers/auth";
import { type Member } from "@/server/api/routers/contact";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
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

export default function GroupHistory({
  groupId,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  useProtectedPage();

  const { data } = api.group.getGroupHistoryById.useQuery({ groupId });

  const historyTableColumns = getHistoryTableColumns(groupId);
  const { table } = useDataTable({
    columns: historyTableColumns,
    data: data?.messages ?? [],
    state: {
      columnVisibility: {
        id: false,
        sender: false,
        scheduled: false,
        recurring: false,
        reminders: false,
      },
    },
  });

  if (!data) {
    return <div>404</div>;
  }

  return (
    <GroupLayout group={data.group}>
      <div className="flex flex-col pb-4 pt-3">
        <h2 className="text-xl font-semibold tracking-tight">Group History</h2>
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

  await helpers.group.getGroupHistoryById.prefetch({ groupId });

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

function getHistoryTableColumns(
  groupId: string,
): ColumnDef<RouterOutputs["group"]["getAll"][number]["messages"][number]>[] {
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
        return (
          <MembersHoverableCell
            members={row.getValue<Member[]>("recipients")}
          />
        );
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
      accessorKey: "time",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Send Time" />
      ),
      cell: ({ row }) => {
        return <DateHoverableCell dateInput={row.original.sentAt} />;
      },
    },
    {
      accessorKey: "sentBy",
      id: "sender",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sent By" />
      ),
      cell: ({ row }) => {
        return <UserHoverableCell user={row.getValue<User>("sender")} />;
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
              onClick={() =>
                navigator.clipboard.writeText(row.getValue<string>("id"))
              }
            >
              Copy message ID
              <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Duplicate message
              <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                href={`/group/${groupId}/message/${row.getValue<string>("id")}`}
                className="w-48"
              >
                View message details
              </Link>
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
            <DropdownMenuItem>
              Delete message
              <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DataTableRowActions>
        );
      },
    },
  ];
}
