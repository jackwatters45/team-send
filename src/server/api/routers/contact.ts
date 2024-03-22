import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { type Group } from "./group";
import { type Message } from "./message";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export interface ContactBase {
  name: string;
  email: string | undefined;
  phone: string | undefined;
  notes: string | undefined;
}

export interface ContactConnections {
  members: Member[];
  messages: Message[];
}

export interface Contact extends ContactBase {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemberBaseContactBase {
  contact: ContactBase;
  memberNotes: string | undefined;
  isRecipient: boolean;
}

export interface MemberBase {
  memberNotes: string | undefined;
  isRecipient: boolean;
  contact: Contact;
}

export interface Member extends MemberBase {
  id: string;
  contact: Contact;
  contactId: string;
  group: Group;
  groupId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const contactRouter = createTRPCRouter({
  getContactById: publicProcedure
    .input(z.object({ contactId: z.string() }))
    .query(async ({ ctx, input }) => {
      const contact = await ctx.db.contact.findUnique({
        where: { id: input.contactId },
        include: {
          members: {
            include: {
              group: true,
            },
          },
        },
      });

      const groups = await ctx.db.group.findMany({
        where: { members: { some: { contactId: input.contactId } } },
      });

      if (!contact) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contact not found",
        });
      }

      return { ...contact, groups };
    }),
});
