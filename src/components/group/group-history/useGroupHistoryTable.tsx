import { useParams } from "next/navigation";

import useDataTable from "@/hooks/useDataTable";
import { api } from "@/utils/api";
import { getHistoryTableColumns } from "./historyTableColumns";

export default function useGroupHistoryTable() {
  const groupId = useParams()?.groupId as string;
  const groupHistory = api.group.getGroupHistory.useQuery(groupId, {
    enabled: !!groupId,
  });

  const historyTableColumns = getHistoryTableColumns(groupId);

  const { table } = useDataTable({
    columns: historyTableColumns,
    data: groupHistory.data?.messages ?? [],
  });

  return { historyTableColumns, groupHistory, table };
}
