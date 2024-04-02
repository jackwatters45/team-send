import { z } from "zod";
import debug from "debug";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { type Group } from "./group";
import { useRateLimit } from "@/server/helpers/rateLimit";
import { handleError } from "@/server/helpers/handleError";
import type { Contact, ContactBase, ContactBaseWithId } from "./contact";

const log = debug("team-send:api:member");

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

export const memberRouter = createTRPCRouter({
  delete: protectedProcedure
    .input(
      z.object({
        memberId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      try {
        await useRateLimit(userId);

        return await ctx.db.member.delete({
          where: {
            id: input.memberId,
            contact: { createdById: userId },
          },
        });
      } catch (error) {
        throw handleError(error);
      }
    }),
});
