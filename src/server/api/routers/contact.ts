import { createTRPCRouter } from "@/server/api/trpc";
import { type User } from "./auth";
import { type Group } from "./group";
import { type Message } from "./message";

export interface ContactBase {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface ContactConnections {
  groups: Group[];
  messages: Message[];
}

export interface Contact extends ContactBase {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Member extends Contact {
  id: string;
  memberNotes?: string;
  isRecipient: boolean;
  contact: User;
  contactId: string;
  group: Group;
  groupId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const contactRouter = createTRPCRouter({
  // getLatest: publicProcedure.input(z.string().optional()).query(({ input }) => {
  //   return !!input
  //     ? contacts.filter((contact) =>
  //         contact.name.toLowerCase().includes(input.toLowerCase()),
  //       )
  //     : contacts;
  // }),
  // getRecentContacts: publicProcedure
  //   .input(z.string().optional())
  //   .query(async ({ input }) => {
  //     await mockAsyncFetch(contacts, 1000);
  //     return !!input
  //       ? contacts.filter((contact) =>
  //           contact.name.toLowerCase().includes(input.toLowerCase()),
  //         )
  //       : contacts;
  //   }),
  // getContactData: publicProcedure.input(z.string()).query(({ input }) => {
  //   return contacts.find((contact) => contact.id === input) as IContact;
  // }),
});
