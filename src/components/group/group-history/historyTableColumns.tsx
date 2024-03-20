import { type ColumnDef } from "@tanstack/react-table";

import { type IMessage } from "@/server/api/routers/message";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DataTableColumnHeader,
  DataTableRowActions,
} from "@/components/ui/data-table";
import { type User } from "@/server/api/routers/auth";
import { type Member } from "@/server/api/routers/contact";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import {
  DateHoverableCell,
  HoverableCell,
  MembersHoverableCell,
  UserHoverableCell,
} from "@/components/ui/hover-card";
import Link from "next/link";

export function getHistoryTableColumns(groupId: string): ColumnDef<IMessage>[] {
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
          name="select-all-rows"
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
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue<string>("status");
        return status?.[0]?.toUpperCase() + status?.slice(1);
      },
    },
    {
      accessorKey: "time",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Time" />
      ),
      cell: ({ row }) => {
        return <DateHoverableCell dateInput={row.getValue<string>("time")} />;
      },
    },
    {
      accessorKey: "content",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Content" />
      ),
      cell: ({ row }) => {
        return <HoverableCell value={row.original.content} />;
      },
    },
    {
      accessorKey: "recipients",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Recipients" />
      ),
      cell: ({ row }) => {
        return (
          <MembersHoverableCell
            members={row.getValue<Member[]>("recipients")}
          />
        );
      },
    },
    {
      accessorKey: "sender",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sender" />
      ),
      cell: ({ row }) => {
        return <UserHoverableCell user={row.getValue<User>("sender")} />;
      },
    },

    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        console.log(row.getValue<string>("status"));
        return (
          <DataTableRowActions>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(row.getValue<string>("id"))
              }
            >
              Copy message ID
              <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Duplicate message
              <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                href={`/group/${groupId}/message/${row.getValue<string>("id")}`}
                className="w-48"
              >
                View message details
              </Link>
            </DropdownMenuItem>
            {row.getValue<string>("status") !== "sent" && (
              <DropdownMenuItem>
                <Link
                  href={`/group/${groupId}/message/${row.getValue<string>("id")}/edit`}
                  className="w-48"
                >
                  Edit message
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              Delete message
              <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DataTableRowActions>
        );
      },
    },
  ];
}
