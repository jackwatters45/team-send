import GroupSettingsForm from "@/components/GroupSettings/GroupSettingsForm";
import { GroupLayout } from "@/layouts/GroupLayout";
import { api } from "@/utils/api";

export default function GroupSettings() {
  const group = api.group.getGroupData.useQuery();

  if (!group.data) {
    return null;
  }

  return <GroupLayout groupData={group.data}>
    <GroupSettingsForm />

  </GroupLayout>;
}
