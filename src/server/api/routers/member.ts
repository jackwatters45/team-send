import { z } from "zod";
import debug from "debug";
import type { Member, MemberSnapshot, Contact } from "@prisma/client";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { useRateLimit } from "@/server/helpers/rateLimit";
import { handleError } from "@/server/helpers/handleError";
import type { NewContact } from "./contact";

const log = debug("team-send:api:member");

export interface NewMember {
  contact: NewContact;
  memberNotes: string | undefined;
  isRecipient: boolean;
  id: string | undefined;
}

export interface MemberWithContact extends Member {
  contact: Contact;
}

export interface MemberSnapshotWithContact extends MemberSnapshot {
  member: { contact: Contact };
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
