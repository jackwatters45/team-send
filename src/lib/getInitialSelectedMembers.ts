import { type IMember } from "@/server/api/routers/contact";
import { type RowSelectionState } from "@tanstack/react-table";

export default function getInitialSelectedMembers(groupMembers: IMember[]) {
  return Object.fromEntries(
    groupMembers?.map((member) => [member.id, member.isRecipient]) ?? [],
  ) as RowSelectionState;
}
