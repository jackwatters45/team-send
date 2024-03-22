import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { type Member } from "./contact";

import { type Message } from "./message";
import { TRPCError } from "@trpc/server";

export interface IGroupBase {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
}

export interface IGroupPreview extends IGroupBase {
  members?: Member[];
}

export interface IGroupHistory extends IGroupBase {
  messages?: Message[];
}

export interface IGroupSettings extends IGroupBase {
  phone: boolean;
  email: boolean;
}

export interface IGroupMetaDetails {
  addedGroups: string[];
  addedContacts: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export type Group = IGroupPreview &
  IGroupSettings &
  IGroupHistory &
  IGroupMetaDetails;

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
});

export const groupRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.group.findMany({
      include: {
        members: {
          include: { contact: true },
        },
        messages: {
          select: { sentAt: true, content: true },
          where: { sentAt: { not: undefined } },
          orderBy: { sentAt: "desc" },
          take: 1,
        },
      },
    });
  }),

  getGroupById: publicProcedure
    .input(
      z.object({
        groupId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // TODO some check to make sure it is the user's group

      const group = await ctx.db.group.findUnique({
        where: { id: input.groupId },
        include: {
          members: {
            include: { contact: true },
          },
          messages: {
            include: { sentBy: true },
          },
        },
      });

      if (!group) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" });
      }

      return group;
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string({ required_error: "TODO add errors" }) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const { success } = await ratelimit.limit(userId);
      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      return ctx.db.group.create({
        data: {
          name: input.name,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),
});
