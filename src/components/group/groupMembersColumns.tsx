import type { ColumnDef } from "@tanstack/react-table";

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
import type { MemberBaseContact } from "@/server/api/routers/contact";
import Link from "next/link";
import { parsePhoneNumber } from "libphonenumber-js";
import { toast } from "../ui/use-toast";

export const groupMembersColumns: ColumnDef<MemberBaseContact>[] = [
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
          onClick={() => {
            navigator.clipboard.writeText(row.getValue<string>("id"));

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
        <DropdownMenuItem>
          Remove from group
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DataTableRowActions>
    ),
  },
];
