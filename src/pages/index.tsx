"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/table/ColumnHeader";
import { Checkbox } from "@/components/ui/checkbox";

import { api } from "@/utils/api";
import Layout from "@/layouts/Layout";

import type { GroupPreview } from "@/server/api/routers/group";
import { GroupsTable } from "@/components/table/DataTable";
import RowActions from "@/components/table/RowActions";

export const columns: ColumnDef<GroupPreview>[] = [
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
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
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
  },
  {
    accessorKey: "lastMessageTime",
    header: ({ column }) => {
      return (
        <DataTableColumnHeader column={column} title="Last Message Time" />
      );
    },
    cell: ({ row }) => {
      return row.getValue<Date>("lastMessageTime").toLocaleString();
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActions payment={row.original} />,
  },
];

export default function Home() {
  const groups = api.group.getLatest.useQuery();

  return (
    <Layout>
      <div className=" ">
        {groups.data ? (
          <GroupsTable columns={columns} data={groups.data} />
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </Layout>
  );
}
