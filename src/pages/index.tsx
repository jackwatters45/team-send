import type { GetServerSideProps } from "next";
import type { ColumnDef } from "@tanstack/react-table";

import { type RouterOutputs, api } from "@/utils/api";
import useDataTable from "@/hooks/useDataTable";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";
import type { Member } from "@/server/api/routers/contact";
import { getServerAuthSession } from "@/server/auth";

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
import { ConfirmDeleteDialog } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";

export default function Home() {
  const { data } = api.group.getAll.useQuery();

  const ctx = api.useUtils();

  const { mutate } = api.group.delete.useMutation({
    onSuccess: (data) => {
      void ctx.group.getAll.invalidate();
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
  const handleDelete = (groupId: string) => mutate({ groupId });

  const groupsColumns = getGroupColumns(handleDelete);
  const { table } = useDataTable({
    columns: groupsColumns,
    data: data ?? [],
    options: {
      sorting: { initial: [{ id: "lastMessageTime", desc: true }] },
    },
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const helpers = genSSRHelpers(session);
  await helpers.group.getAll.prefetch();

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
};

const getGroupColumns = (
  handleDelete: (groupId: string) => void,
): ColumnDef<RouterOutputs["group"]["getAll"][number]>[] => [
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
      const lastMessageTime = row.original.messages?.[0]?.sendAt;

      if (!lastMessageTime) return null;

      return <DateHoverableCell dateInput={lastMessageTime} />;
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
            Send
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
          <ConfirmDeleteDialog
            triggerText="Delete group"
            onConfirm={() => handleDelete(id)}
          />
        </DataTableRowActions>
      );
    },
  },
];
