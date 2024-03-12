import { useParams } from "next/navigation";

import { api } from "@/utils/api";
import { useDataTable } from "@/hooks/useDataTable";
import { groupMembersColumns } from "./groupMembersColumns";

export default function useGroupMembersTable() {
  const groupId = useParams().groupId as string;
  const groupMembers = api.group.getGroupMembers.useQuery(groupId);

  const table = useDataTable({
    columns: groupMembersColumns,
    data: groupMembers.data ?? [],
    includePagination: false,
  });

  return {
    groupMembers,
    table,
  };
}
