import type { ColumnDef } from "@tanstack/react-table";
import type { GetServerSidePropsContext } from "next";

import { getServerAuthSession } from "@/server/auth";
import { type RouterOutputs, api } from "@/utils/api";
import useDataTable from "@/hooks/useDataTable";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";
import type { Member } from "@/server/api/routers/contact";

import Layout from "@/layouts/Layout";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DataTableColumnOptions,
  DataTableContent,
  DataTableFilter,
  DataTablePagination,
  DataTableSelectedRowCount,
} from "@/components/ui/data-table";
import {
  DateHoverableCell,
  HoverableCell,
  MembersHoverableCell,
} from "@/components/ui/hover-card";
import {
  DataTableColumnHeader,
  DataTableRowActions,
} from "@/components/ui/data-table";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const { data } = api.group.getAll.useQuery();

  const { table } = useDataTable({
    columns: groupsColumns,
    data: data ?? [],
  });

  if (!data) {
    return null;
  }

  return (
    <Layout>
      <h2 className="text-2xl">Your Groups</h2>
      <div>
        <div className="flex items-center py-4">
          <DataTableFilter table={table} placeholder="Search groups" />
          <DataTableColumnOptions table={table} />
        </div>
        <div className="rounded-md border dark:border-stone-700">
          <DataTableContent table={table} columns={groupsColumns} />
        </div>
        <div className="flex items-center justify-between p-2">
          <DataTableSelectedRowCount table={table} />
          <DataTablePagination table={table} />
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const session = await getServerAuthSession(context);
  if (!session) return { redirect: { destination: "/login" } };

  const helpers = genSSRHelpers();
  await helpers.group.getAll.prefetch();

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
};

type IGroupMessagesMembers = RouterOutputs["group"]["getAll"][number];

const groupsColumns: ColumnDef<IGroupMessagesMembers>[] = [
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
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "lastMessage",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Message" />
    ),
    cell: ({ row }) => {
      const lastMessage = row.original.messages?.[0]?.content;
      return <HoverableCell value={lastMessage} />;
    },
  },
  {
    accessorKey: "lastMessageTime",
    header: ({ column }) => {
      return (
        <DataTableColumnHeader column={column} title="Last Message Time" />
      );
    },
    cell: ({ row }) => {
      const lastMessageTime = row.original.messages?.[0]?.sentAt;

      return lastMessageTime ? (
        <DateHoverableCell dateInput={lastMessageTime} />
      ) : (
        <div></div> // TODO ??
      );
    },
  },
  {
    accessorKey: "members",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Members" />
    ),
    cell: ({ row }) => {
      return (
        <MembersHoverableCell members={row.getValue<Member[]>("members")} />
      );
    },
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const id = row.original?.id;
      return (
        <DataTableRowActions>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(id)}
            className="w-48"
          >
            Copy group ID
            <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="font-semibold">
            View details
          </DropdownMenuLabel>
          <DropdownMenuLinkItem href={`/group/${id}`}>
            Details
          </DropdownMenuLinkItem>
          <DropdownMenuLinkItem href={`/group/${id}/members`}>
            Members
          </DropdownMenuLinkItem>
          <DropdownMenuLinkItem href={`/group/${id}/history`}>
            History
          </DropdownMenuLinkItem>
          <DropdownMenuLinkItem href={`/group/${id}/settings`}>
            Settings
          </DropdownMenuLinkItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            Delete group
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DataTableRowActions>
      );
    },
  },
];
