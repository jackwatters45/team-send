import type { ColumnDef, Table } from "@tanstack/react-table";

import {
  DataTableColumnOptions,
  DataTableContent,
  DataTableFilter,
  DataTablePagination,
  DataTableSelectedRowCount,
} from "@/components/ui/data-table";

import type { MemberBaseContact } from "@/server/api/routers/member";

interface IGroupMembersTableProps {
  table: Table<MemberBaseContact>;
  columns: ColumnDef<MemberBaseContact>[];
  placeholder?: string;
}

export default function GroupMembersTable({
  table,
  columns,
  placeholder = "Search members",
}: IGroupMembersTableProps) {
  return (
    <div>
      <div className="flex items-center py-4">
        <DataTableFilter table={table} placeholder={placeholder} />
        <DataTableColumnOptions table={table} />
      </div>
      <div className="rounded-md border dark:border-stone-700">
        <DataTableContent table={table} columns={columns} />
      </div>
      <div className="flex items-center justify-between p-2">
        <DataTableSelectedRowCount table={table} />
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
