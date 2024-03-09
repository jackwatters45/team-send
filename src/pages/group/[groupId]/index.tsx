import GroupSendMessage from "@/components/group-send-message/GroupSendMessage";
import { GroupLayout } from "@/layouts/GroupLayout";
import { api } from "@/utils/api";

export default function Group() {
  const group = api.group.getGroupData.useQuery();

  if (!group.data) {
    return null;
  }

  return (
    <GroupLayout groupData={group.data}>
      <GroupSendMessage />
    </GroupLayout>
  );
}
