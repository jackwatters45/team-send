import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import type { IGroupPreview } from "@/server/api/routers/group";
import type { IContact } from "@/server/api/routers/contact";

import { Checkbox } from "@/components/ui/checkbox";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  HoverableCell,
} from "@/components/ui/hover-card";
import {
  DataTableColumnHeader,
  DataTableRowActions,
} from "@/components/ui/data-table";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
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
      return row.getValue<Date>("lastMessageTime").toLocaleString();
    },
  },
  {
    accessorKey: "members",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Members" />
    ),
    cell: ({ row }) => {
      const members = row.getValue<IContact[]>("members");
      return (
        <HoverCard>
          <HoverCardTrigger>{`${members.length} members`}</HoverCardTrigger>
          <HoverCardContent className="flex flex-wrap gap-1 text-xs">
            {members.map((member, index) => (
              <div key={member.id}>
                {member.name}
                {index !== members.length - 1 ? ", " : ""}
              </div>
            ))}
          </HoverCardContent>
        </HoverCard>
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
        <DropdownMenuItem>
          <Link href={`/group/${row.getValue<string>("id")}`}>Details</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href={`/group/${row.getValue<string>("id")}/members`}>
            Members
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href={`/group/${row.getValue<string>("id")}/history`}>
            History
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href={`/group/${row.getValue<string>("id")}/settings`}>
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Delete group
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DataTableRowActions>
    ),
  },
];
