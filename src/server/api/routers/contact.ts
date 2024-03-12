import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export interface INewContact {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface IContact extends INewContact {
  id: string;
}

export const contacts: IContact[] = [
  {
    id: "1",
    name: "Pedro Duarte",
    email: "pedro@gmail.com",
    phone: "+12234567890",
    notes: "Some notes",
  },
  {
    id: "2",
    name: "John Doe",
    email: "",
    phone: "+19876543210",
    notes: "",
  },
  {
    id: "3",
    name: "Sarah Williams",
    email: "sarah.williams@example.com",
    phone: "+15551239876",
    notes: "Marketing lead",
  },
  {
    id: "4",
    name: "Michael Johnson",
    email: "mjohnson@company.com",
    phone: "+14259875555",
    notes: "",
  },
  {
    id: "5",
    name: "Emily Brown",
    email: "emilyb@domain.net",
    phone: "+16043219876",
    notes: "Product manager",
  },
  {
    id: "6",
    name: "David Miller",
    email: "", // Optional email
    phone: "+18005551212",
    notes: "",
  },
  {
    id: "7",
    name: "Olivia Taylor",
    email: "olivia.taylor@email.com",
    phone: "+13128765432",
    notes: "Sales representative",
  },
  {
    id: "8",
    name: "Alexander Thompson",
    email: "a.thompson@provider.com",
    phone: "", // Optional phone
    notes: "Software developer",
  },
  {
    id: "9",
    name: "Jessica Davis",
    email: "jessdavis@email.org",
    phone: "+19735550123",
    notes: "",
  },
  {
    id: "10",
    name: "Christopher Smith",
    email: "chrissmith@email.com",
    phone: "+16505559876",
    notes: "Account manager",
  },
];

export const contactRouter = createTRPCRouter({
  getLatest: publicProcedure.input(z.string().optional()).query(({ input }) => {
    return !!input
      ? contacts.filter((contact) =>
          contact.name.toLowerCase().includes(input.toLowerCase()),
        )
      : contacts;
  }),
});