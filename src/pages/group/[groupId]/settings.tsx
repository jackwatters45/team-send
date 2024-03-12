import GroupSettingsForm from "@/components/group/group-settings/GroupSettingsForm";
import { GroupLayout } from "@/layouts/GroupLayout";
import { api } from "@/utils/api";

export default function GroupSettings() {
  const group = api.group.getGroupData.useQuery();

  if (!group.data) {
    return null;
  }

  return (
    <GroupLayout groupData={group.data}>
      <GroupSettingsForm />
    </GroupLayout>
  );
}
