import { useEffect } from "react";
import { useRouter } from "next/router";

import { api } from "@/utils/api";
import useDataTable from "@/hooks/useDataTable";
import { getGroupMembersColumns } from "./groupMembersColumns";
import { type Contact } from "@/server/api/routers/contact";
import getInitialSelectedMembers from "@/lib/getInitialSelectedMembers";

export default function useGroupMembersTable() {
  const groupId = useRouter().query.groupId as string;
  const groupMembers = api.group.getGroupMembers.useQuery(groupId);

  const { table, rowSelection, setRowSelection } = useDataTable({
    columns: getGroupMembersColumns(),
    data: groupMembers.data ?? [],
    getRowId: (row: Contact) => row.id,
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
