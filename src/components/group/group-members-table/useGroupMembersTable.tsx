import { useParams } from "next/navigation";

import { api } from "@/utils/api";
import { useDataTable } from "@/hooks/useDataTable";
import { getGroupMembersColumns } from "./groupMembersColumns";

export default function useGroupMembersTable() {
  const groupId = useParams().groupId as string;
  const groupMembers = api.group.getGroupMembers.useQuery(groupId);

  const groupMembersColumns = getGroupMembersColumns();
  const table = useDataTable({
    columns: groupMembersColumns,
    data: groupMembers.data ?? [],
  });

  const selectedRows = table.getSelectedRowModel().flatRows ?? [];
  const selectedRowIds = selectedRows.map((row) => row.original.id);

  return {
    groupMembersColumns,
    groupMembers,
    table,
  };
}
