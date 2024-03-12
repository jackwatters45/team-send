import {
  DataTableColumnOptions,
  DataTableContent,
  DataTableFilter,
  DataTableSelectedRowCount,
  DataTableSkeleton,
} from "@/components/ui/data-table";
import { groupMembersColumns } from "./groupMembersColumns";
import { api } from "@/utils/api";
import { useParams } from "next/navigation";
import { useDataTable } from "@/hooks/useDataTable";

export default function GroupMembersTable() {
  const groupId = useParams().groupId as string;
  const groupMembers = api.group.getGroupMembers.useQuery(groupId);

  const table = useDataTable({
    columns: groupMembersColumns,
    data: groupMembers.data ?? [],
    includePagination: false,
  });

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
          </div>
        </div>
      ) : (
        <DataTableSkeleton />
      )}
    </div>
  );
}
