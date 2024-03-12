import type { ColumnDef } from "@tanstack/react-table";
import parsePhoneNumber from "libphonenumber-js";

import { Checkbox } from "@/components/ui/checkbox";

import { HoverableCell } from "@/components/ui/hover-card";
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
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ row }) => {
      const phoneNumber = parsePhoneNumber(row.getValue<string>("phone"));

      return phoneNumber
        ? phoneNumber.formatNational()
        : row.getValue<string>("phone");
    },
  },
  {
    accessorKey: "notes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notes" className="flex-1" />
    ),
    cell: ({ row }) => <HoverableCell row={row} accessorKey="notes" />,
  },
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
          Copy member ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>View member details</DropdownMenuItem>
        <DropdownMenuItem>Remove member from group</DropdownMenuItem>
      </DataTableRowActions>
    ),
  },
];
