import type { GroupMembersFormType } from "@/components/group/group-members-form/groupMembersSchema";

const createContact = (
  newMember?: GroupMembersFormType["members"][0],
): GroupMembersFormType["members"][0] => ({
  contact: {
    name: newMember?.contact.name ?? "",
    email: newMember?.contact.email ?? "",
    phone: newMember?.contact.phone ?? "",
    notes: newMember?.contact.notes ?? "",
  },
  memberNotes: newMember?.memberNotes ?? "",
  isRecipient: newMember?.isRecipient ?? true,
});

export default createContact;
