import {
  DataTableColumnOptions,
  DataTableContent,
  DataTableFilter,
  DataTablePagination,
  DataTableSelectedRowCount,
  DataTableSkeleton,
} from "../../ui/data-table";
import { groupsColumns } from "./groupsColumns";
import GroupsTablePlaceholder from "./GroupsTablePlaceholder";
import useGroupsTable from "./useGroupsTable";

export default function GroupsTable() {
  const { groups, table } = useGroupsTable();

  return !!groups.data || groups.status === "loading" ? (
    <>
      <h2 className="text-2xl">Your Groups</h2>
      <div>
        {groups.data ? (
          <div>
            <div className="flex items-center py-4">
              <DataTableFilter table={table} placeholder="Search groups" />
              <DataTableColumnOptions table={table} />
            </div>
            <div className="rounded-md border dark:border-stone-700">
              <DataTableContent table={table} columns={groupsColumns} />
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
    </>
  ) : (
    <GroupsTablePlaceholder />
  );
}
