import {
  DataTableColumnOptions,
  DataTableContent,
  DataTableFilter,
  DataTablePagination,
  DataTableSelectedRowCount,
  DataTableSkeleton,
} from "@/components/ui/data-table";
import { groupMembersColumns } from "./groupMembersColumns";
import useGroupMembersTable from "./useGroupMembersTable";

export default function GroupMembersTable() {
  const { groupMembers, table } = useGroupMembersTable();

  return (
    <div>
      {groupMembers.data ? (
        <div>
          <div className="flex items-center py-4">
            <DataTableFilter table={table} placeholder="Search members" />
            <DataTableColumnOptions table={table} />
          </div>
          <div className="rounded-md border dark:border-stone-700">
            <DataTableContent table={table} columns={groupMembersColumns} />
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
