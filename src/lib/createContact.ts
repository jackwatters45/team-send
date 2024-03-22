import type { MemberBaseContactBase } from "@/server/api/routers/contact";

const createContact = (
  newMember?: MemberBaseContactBase,
): MemberBaseContactBase => ({
  contact: {
    name: newMember?.contact.name ?? "",
    email: newMember?.contact.email ?? "",
    phone: newMember?.contact.phone ?? "",
    notes: newMember?.contact.notes ?? "",
  },
  memberNotes: newMember?.memberNotes ?? "",
  isRecipient: newMember?.isRecipient ?? false,
});

export default createContact;
