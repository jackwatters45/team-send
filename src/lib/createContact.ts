import type {  INewMember } from "@/server/api/routers/contact";

const createContact = (contact?: INewMember): INewMember => ({
  name: contact?.name ?? "",
  email: contact?.email ?? "",
  phone: contact?.phone ?? "",
  notes: contact?.notes ?? "",
  isRecipient: true,
});

export default createContact;
