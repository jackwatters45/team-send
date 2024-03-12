import type { INewContact } from "@/server/api/routers/contact";

const createContact = (contact?: INewContact): INewContact => ({
  name: contact?.name ?? "",
  email: contact?.email ?? "",
  phone: contact?.phone ?? "",
  notes: contact?.notes ?? "",
});

export default createContact;
