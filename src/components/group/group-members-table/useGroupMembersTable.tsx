import { useEffect } from "react";

import useDataTable from "@/hooks/useDataTable";
import { getGroupMembersColumns } from "./groupMembersColumns";
import type { MemberBaseContact } from "@/server/api/routers/contact";
import getInitialSelectedMembers from "@/lib/getInitialSelectedMembers";

export default function useGroupMembersTable(
  data: MemberBaseContact[] | undefined,
) {
  const { table, rowSelection, setRowSelection } = useDataTable({
    columns: getGroupMembersColumns(),
    data: data ?? [],
    getRowId: (row: MemberBaseContact) => row.contact?.id,
    enableRowSelection: (row) =>
      !!row.original.contact.phone || !!row.original.contact.email,
  });

  useEffect(() => {
    if (!data) return;
    setRowSelection(getInitialSelectedMembers(data ?? []));
  }, [data, setRowSelection]);

  return {
    table,
    rowSelection,
    setRowSelection,
  };
}
