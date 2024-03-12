import { GroupLayout } from "@/layouts/GroupLayout";
import GroupMembersForm from "@/components/group/group-members-form/GroupMembersForm";
import { api } from "@/utils/api";

export default function GroupMembers() {
  const group = api.group.getGroupData.useQuery();

  if (!group.data) {
    return null;
  }

  return (
    <GroupLayout group={group.data}>
      <GroupMembersForm group={group.data} />
    </GroupLayout>
  );
}
