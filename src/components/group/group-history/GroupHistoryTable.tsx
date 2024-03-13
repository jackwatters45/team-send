import {
  DataTableColumnOptions,
  DataTableContent,
  DataTableFilter,
  DataTablePagination,
  DataTableSelectedRowCount,
  DataTableSkeleton,
} from "@/components/ui/data-table";
import useGroupHistoryTable from "./useGroupHistoryTable";

export default function GroupHistoryTable() {
  const { historyTableColumns, groupHistory, table } = useGroupHistoryTable();

  return !!groupHistory.data || groupHistory.status === "loading" ? (
    <div>
      {groupHistory.data ? (
        <div>
          <div className="flex items-center py-4">
            <DataTableFilter
              table={table}
              placeholder="Search history"
              field="content"
            />
            <DataTableColumnOptions table={table} />
          </div>
          <div className="rounded-md border dark:border-stone-700">
            <DataTableContent table={table} columns={historyTableColumns} />
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
  ) : (
    <div />
  );
}
