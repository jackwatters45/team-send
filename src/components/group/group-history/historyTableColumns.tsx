import { type ColumnDef } from "@tanstack/react-table";

import { type IMessage } from "@/server/api/routers/group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DataTableColumnHeader,
  DataTableRowActions,
} from "@/components/ui/data-table";
import { type IUser } from "@/server/api/routers/auth";
import { type IMember } from "@/server/api/routers/contact";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  DateHoverableCell,
  HoverableCell,
  MembersHoverableCell,
  UserHoverableCell,
} from "@/components/ui/hover-card";

export const historyTableColumns: ColumnDef<IMessage>[] = [
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
    accessorKey: "content",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Content" />
    ),
    cell: ({ row }) => {
      return <HoverableCell row={row} accessorKey="content" />;
    },
  },
  {
    accessorKey: "recipients",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Recipients" />
    ),
    cell: ({ row }) => {
      return (
        <MembersHoverableCell members={row.getValue<IMember[]>("recipients")} />
      );
    },
  },
  {
    accessorKey: "sender",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sender" />
    ),
    cell: ({ row }) => {
      return <UserHoverableCell user={row.getValue<IUser>("sender")} />;
    },
  },
  {
    accessorKey: "time",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Time" />
    ),
    cell: ({ row }) => {
      return <DateHoverableCell dateString={row.getValue<string>("time")} />;
    },
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
          Copy payment ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>View customer</DropdownMenuItem>
        <DropdownMenuItem>View payment details</DropdownMenuItem>
      </DataTableRowActions>
    ),
  },
];

// TODO commits 
// TODO links