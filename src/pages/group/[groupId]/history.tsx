import GroupHistoryTable from "@/components/group/group-history/GroupHistoryTable";
import { GroupLayout } from "@/layouts/GroupLayout";
import { api } from "@/utils/api";

export default function GroupHistory() {
  const group = api.group.getGroupData.useQuery();

  if (!group.data) {
    return null;
  }

  return (
    <GroupLayout group={group.data}>
      <div className="flex flex-col pb-4 pt-3">
        <h2 className="text-xl font-semibold tracking-tight">Group History</h2>
        <div className="text-sm text-stone-500 dark:text-stone-400">
          View message and user history for this group.
        </div>
      </div>
      <GroupHistoryTable />
    </GroupLayout>
  );
}
