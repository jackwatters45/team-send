import { useDataTable } from "@/hooks/useDataTable";
import { api } from "@/utils/api";
import { groupsColumns } from "./groupsColumns";

export default function useGroupsTable() {
  const groups = api.group.getLatest.useQuery();

  const table = useDataTable({
    columns: groupsColumns,
    data: groups.data ?? [],
  });

  return { groups, table };
}
