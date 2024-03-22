import type { MemberBaseContact } from "@/server/api/routers/contact";
import { type RowSelectionState } from "@tanstack/react-table";

export default function getInitialSelectedMembers(
  groupMembers: MemberBaseContact[],
) {
  return Object.fromEntries(
    groupMembers?.map((member) => [member.contact.id, member.isRecipient]) ??
      [],
  ) as RowSelectionState;
}
