import GroupSettingsForm from "@/components/group/group-settings/GroupSettingsForm";
import { GroupLayout } from "@/layouts/GroupLayout";
import { api } from "@/utils/api";
import { useParams } from "next/navigation";

export default function GroupSettings() {
  const groupId = useParams()?.groupId as string;
  const groupSettings = api.group.getGroupSettings.useQuery(groupId, {
    enabled: !!groupId,
  });

  if (!groupSettings.data) {
    return null;
  }

  return (
    <GroupLayout group={groupSettings.data}>
      <GroupSettingsForm  group={groupSettings.data} />
    </GroupLayout>
  );
}
