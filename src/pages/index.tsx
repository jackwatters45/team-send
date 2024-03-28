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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data } = api.group.getAll.useQuery();

  const ctx = api.useUtils();

  const { mutate } = api.group.delete.useMutation({
    onSuccess: () => {
      void ctx.group.getAll.invalidate();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Failed to delete",
        description: "There was an error deleting the group. Please try again.",
      });
    },
  });

  const groupsColumns = getGroupColumns(mutate);
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

type IGroupMessagesMembers = RouterOutputs["group"]["getAll"][number];

const getGroupColumns = (
  deleteMutation: ReturnType<typeof api.group.delete.useMutation>["mutate"],
): ColumnDef<IGroupMessagesMembers>[] => [
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
          <AlertDialog>
            <AlertDialogTrigger asChild className="w-full">
              <Button
                className="h-fit select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-stone-100 focus:bg-stone-100 focus:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-50 dark:focus:bg-stone-800 dark:focus:text-stone-50"
                variant="ghost"
              >
                Delete group
                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation({ groupId: id })}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DataTableRowActions>
      );
    },
  },
];
