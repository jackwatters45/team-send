import { useParams } from "next/navigation";

import { useDataTable } from "@/hooks/useDataTable";
import { api } from "@/utils/api";
import {
  DataTableColumnOptions,
  DataTableContent,
  DataTableFilter,
  DataTablePagination,
  DataTableSelectedRowCount,
  DataTableSkeleton,
} from "@/components/ui/data-table";
import { historyTableColumns } from "./historyTableColumns";

export default function GroupHistoryTable() {
  const groupId = useParams()?.groupId as string;
  const groupHistory = api.group.getGroupHistory.useQuery(groupId, {
    enabled: !!groupId,
  });

  const table = useDataTable({
    columns: historyTableColumns,
    data: groupHistory.data?.messages ?? [],
  });

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
