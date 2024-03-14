"use client";
import { type Table } from "@tanstack/react-table";

import {
  DataTableColumnOptions,
  DataTableContent,
  DataTableFilter,
  DataTablePagination,
  DataTableSelectedRowCount,
  DataTableSkeleton,
} from "@/components/ui/data-table";

import { type api } from "@/utils/api";
import { getGroupMembersColumns } from "./groupMembersColumns";
import { type IContact } from "@/server/api/routers/contact";

interface IGroupMembersTableProps {
  table: Table<IContact>;
  groupMembers: ReturnType<typeof api.group.getGroupMembers.useQuery>;
}

export default function GroupMembersTable({
  table,
  groupMembers,
}: IGroupMembersTableProps) {
  return (
    <div>
      {groupMembers.data ? (
        <div>
          <div className="flex items-center py-4">
            <DataTableFilter table={table} placeholder="Search members" />
            <DataTableColumnOptions table={table} />
          </div>
          <div className="rounded-md border dark:border-stone-700">
            <DataTableContent
              table={table}
              columns={getGroupMembersColumns()}
            />
          </div>
          <div className="flex items-center justify-between p-2">
            <DataTableSelectedRowCount table={table} />
            <DataTablePagination table={table} />
          </div>
        </div>
      ) : (
        <DataTableSkeleton />
      )}
    </div>
  );
}
