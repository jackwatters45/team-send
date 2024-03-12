import type { UseFormReturn } from "react-hook-form";

import type { GroupMembersFormType } from "@/components/group/group-members-form/groupMembersSchema";
import GroupMemberList from "@/components/group/group-members-form/GroupMemberList";
import GroupMembersHeader from "@/components/group/group-members-form/GroupMembersHeader";
import GroupMembersRecents from "./members-recent/GroupMembersRecents.1";
import { Button } from "@/components/ui/button";

interface IGroupMembersFormContentProps {
  title: string;
  submitText: string;
  form: UseFormReturn<GroupMembersFormType>;
}

export default function GroupMembersFormContent({
  title,
  submitText,
  form,
}: IGroupMembersFormContentProps) {
  return (
    <>
      <GroupMembersHeader title={title} />
      <GroupMemberList form={form} />
      <GroupMembersRecents form={form} />
      <Button type="submit">{submitText}</Button>
    </>
  );
}
