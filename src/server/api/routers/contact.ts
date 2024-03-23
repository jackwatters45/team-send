import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { type Group } from "./group";
import { type Message } from "./message";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export interface ContactBase {
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
}

export interface ContactBaseWithId extends ContactBase {
  id: string;
}

export interface ContactConnections {
  members: Member[];
  messages: Message[];
}

export interface Contact extends ContactBaseWithId {
  createdAt: Date;
  updatedAt: Date;
}

interface MemberBase {
  memberNotes: string | null;
  isRecipient: boolean;
}

export interface MemberBaseNewContact extends MemberBase {
  contact: ContactBase;
}

export interface MemberBaseContact extends MemberBase {
  contact: ContactBaseWithId;
}

export interface Member extends MemberBaseContact {
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
      });

      const groups = await ctx.db.group.findMany({
        where: { members: { some: { contactId: input.contactId } } },
        include: { members: true },
      });

      if (!contact) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contact not found",
        });
      }

      return { ...contact, groups };
    }),
  getRecentContacts: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        addedContactIds: z.array(z.string()),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!input.search) {
        return await ctx.db.contact.findMany({
          where: { id: { notIn: input.addedContactIds } },
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            notes: true,
          },
          take: 10,
          orderBy: { updatedAt: "desc" },
        });
      } else {
        return await ctx.db.contact.findMany({
          where: {
            name: { contains: input.search },
            id: { notIn: input.addedContactIds },
          },
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            notes: true,
          },
          take: 10,
          orderBy: { updatedAt: "desc" },
        });
      }
    }),
});
