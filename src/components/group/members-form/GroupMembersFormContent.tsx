import type { UseFormReturn } from "react-hook-form";

import type { ICreateGroupSchema } from "@/components/create-group/createGroupSchema";
import GroupMemberList from "@/components/group/members-form/GroupMemberList";
import GroupMembersHeader from "@/components/group/members-form/GroupMembersHeader";
import GroupMembersRecents from "@/components/group/members-form/GroupMembersRecents";
import { Button } from "@/components/ui/button";

interface IGroupMembersFormContentProps {
  title: string;
  submitText: string;
  form: UseFormReturn<ICreateGroupSchema>;
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
