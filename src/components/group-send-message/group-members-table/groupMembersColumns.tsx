import type { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";


import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  DataTableColumnHeader,
  DataTableRowActions,
} from "@/components/ui/data-table";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { IUser } from "@/server/api/routers/user";

export const groupMembersColumns: ColumnDef<IUser>[] = [
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
  // {
  //   accessorKey: "lastMessage",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Last Message" />
  //   ),
  //   cell: ({ row }) => {
  //     const value = row.getValue<string>("lastMessage");
  //     return (
  //       <HoverCard>
  //         <HoverCardTrigger>{`${value.slice(0, 20)}...`}</HoverCardTrigger>
  //         <HoverCardContent>{value}</HoverCardContent>
  //       </HoverCard>
  //     );
  //   },
  // },
  // {
  //   accessorKey: "lastMessageTime",
  //   header: ({ column }) => {
  //     return (
  //       <DataTableColumnHeader column={column} title="Last Message Time" />
  //     );
  //   },
  //   cell: ({ row }) => {
  //     return row.getValue<Date>("lastMessageTime").toLocaleString();
  //   },
  // },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() =>
            navigator.clipboard.writeText(row.getValue<string>("id"))
          }
        >
          Copy payment ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>View customer</DropdownMenuItem>
        <DropdownMenuItem>View payment details</DropdownMenuItem>
      </DataTableRowActions>
    ),
  },
];