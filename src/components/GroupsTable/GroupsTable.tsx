import { DataTable, DataTableSkeleton } from "../ui/data-table";
import { groupsColumns } from "./GroupsColumns";
import GroupsTablePlaceholder from "./GroupsTablePlaceholder";
import { api } from "@/utils/api";

export default function GroupsTable() {
  const groups = api.group.getLatest.useQuery();

  return !!groups.data || groups.status === "loading" ? (
    <>
      <h2 className="text-2xl">Your Groups</h2>
      <div>
        {groups.data ? (
          <DataTable columns={groupsColumns} data={groups.data} />
        ) : (
          <DataTableSkeleton />
        )}
      </div>
    </>
  ) : (
    <GroupsTablePlaceholder />
  );
}
