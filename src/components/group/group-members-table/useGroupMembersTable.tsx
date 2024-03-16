import { useParams } from "next/navigation";

import { api } from "@/utils/api";
import useDataTable from "@/hooks/useDataTable";
import { getGroupMembersColumns } from "./groupMembersColumns";
import { type IContact } from "@/server/api/routers/contact";

import { useEffect } from "react";
import getInitialSelectedMembers from "@/lib/getInitialSelectedMembers";

export default function useGroupMembersTable() {
  const groupId = useParams().groupId as string;
  const groupMembers = api.group.getGroupMembers.useQuery(groupId);

  const { table, rowSelection, setRowSelection } = useDataTable({
    columns: getGroupMembersColumns(),
    data: groupMembers.data ?? [],
    getRowId: (row: IContact) => row.id,
    enableRowSelection: (row) => !!row.original.phone || !!row.original.email,
  });

  useEffect(() => {
    if (!groupMembers.data) return;
    setRowSelection(getInitialSelectedMembers(groupMembers.data ?? []));
  }, [groupMembers.data, setRowSelection]);

  return {
    groupMembers,
    table,
    rowSelection,
    setRowSelection,
  };
}
