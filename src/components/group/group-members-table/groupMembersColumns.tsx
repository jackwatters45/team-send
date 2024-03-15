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
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import type { IContact } from "@/server/api/routers/contact";
import Link from "next/link";

export const getGroupMembersColumns = (): ColumnDef<IContact>[] => {
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
          name="select-all"
        />
      ),
      cell: ({ row }) => {
        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            name="select-row"
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
        <DataTableColumnHeader
          column={column}
          title="Notes"
          className="flex-1"
        />
      ),
      cell: ({ row }) => <HoverableCell row={row} accessorKey="notes" />,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions>
          <DropdownMenuItem
            onClick={() =>
              navigator.clipboard.writeText(row.getValue<string>("id"))
            }
            className="w-48"
          >
            Copy member ID
            <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <Link href={`/contact/${row.getValue<string>("id")}`}>
            <DropdownMenuItem>View member details</DropdownMenuItem>
          </Link>
          <DropdownMenuItem>
            Remove from group
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DataTableRowActions>
      ),
    },
  ];
};
