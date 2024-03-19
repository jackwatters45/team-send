import type { ColumnDef } from "@tanstack/react-table";

import type { IGroupPreview } from "@/server/api/routers/group";
import type { IMember } from "@/server/api/routers/contact";

import { Checkbox } from "@/components/ui/checkbox";
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

export const groupsColumns: ColumnDef<IGroupPreview>[] = [
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
      console.log(row);
      return <HoverableCell row={row} accessorKey="lastMessage" />;
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
      return (
        <DateHoverableCell
          dateString={row.getValue<string>("lastMessageTime")}
        />
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
        <MembersHoverableCell members={row.getValue<IMember[]>("members")} />
      );
    },
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
          Copy group ID
          <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="font-semibold">
          View details
        </DropdownMenuLabel>
        <DropdownMenuLinkItem href={`/group/${row.getValue<string>("id")}`}>
          Details
        </DropdownMenuLinkItem>
        <DropdownMenuLinkItem
          href={`/group/${row.getValue<string>("id")}/members`}
        >
          Members
        </DropdownMenuLinkItem>
        <DropdownMenuLinkItem
          href={`/group/${row.getValue<string>("id")}/history`}
        >
          History
        </DropdownMenuLinkItem>
        <DropdownMenuLinkItem
          href={`/group/${row.getValue<string>("id")}/settings`}
        >
          Settings
        </DropdownMenuLinkItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Delete group
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DataTableRowActions>
    ),
  },
];
