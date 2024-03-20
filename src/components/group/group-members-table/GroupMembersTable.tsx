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

import { getGroupMembersColumns } from "./groupMembersColumns";
import { type Contact } from "@/server/api/routers/contact";

interface IGroupMembersTableProps {
  table: Table<Contact>;
  isLoading?: boolean;
  placeholder?: string;
}

export default function GroupMembersTable({
  table,
  isLoading = false,
  placeholder = "Search members",
}: IGroupMembersTableProps) {
  return (
    <div>
      {!isLoading ? (
        <div>
          <div className="flex items-center py-4">
            <DataTableFilter table={table} placeholder={placeholder} />
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
