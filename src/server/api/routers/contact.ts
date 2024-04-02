import { z } from "zod";
import debug from "debug";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { type Group } from "./group";
import { type Message } from "./message";
import { TRPCError } from "@trpc/server";
import type { User } from "./auth";
import { useRateLimit } from "@/server/helpers/rateLimit";
import { handleError } from "@/server/helpers/handleError";

const log = debug("team-send:api:contact");

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
  createdBy: User;
  createdById: string;
}

interface MemberBase {
  memberNotes: string | null;
  isRecipient: boolean;
}

export interface MemberBaseNewContact extends MemberBase {
  contact: ContactBase;
}

export interface MemberBaseContact extends MemberBase {
  id: string;
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
  getContactById: protectedProcedure
    .input(z.object({ contactId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        await useRateLimit(userId);

        const contact = await ctx.db.contact.findUnique({
          where: {
            id: input.contactId,
            createdById: userId,
          },
        });

        if (!contact) throwContactNotFoundError(input.contactId);

        const members = await ctx.db.member.findMany({
          where: { contactId: input.contactId },
          include: {
            group: {
              select: {
                id: true,
                name: true,
                image: true,
                members: { select: { id: true } },
              },
            },
          },
        });

        return { ...contact, members };
      } catch (error) {
        handleError(error);
      }
    }),
  getRecentContacts: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        addedContactIds: z.array(z.string()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        await useRateLimit(userId);

        if (!input.search) {
          return await ctx.db.contact.findMany({
            where: {
              id: { notIn: input.addedContactIds },
              createdById: userId,
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
        } else {
          return await ctx.db.contact.findMany({
            where: {
              name: { contains: input.search, mode: "insensitive" },
              id: { notIn: input.addedContactIds },
              createdById: userId,
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
      } catch (error) {
        handleError(error);
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z
          .string()
          .or(
            z
              .string()
              .email()
              .refine((val) => val !== "", "Invalid email"),
          )
          .nullish(),
        phone: z.string().nullish(),
        notes: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        await useRateLimit(userId);

        const contact = await ctx.db.contact.update({
          where: { id: input.id, createdById: userId },
          data: {
            name: input.name,
            email: input.email ?? null,
            phone: input.phone ?? null,
            notes: input.notes ?? null,
          },
        });

        if (!contact) throwContactNotFoundError(input.id);

        return contact;
      } catch (error) {
        handleError(error);
      }
    }),
});

function throwContactNotFoundError(contactId: string) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: `Contact with id "${contactId}" not found`,
  });
}
