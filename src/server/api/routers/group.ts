import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { type IMember } from "./contact";

import { type IMessage } from "./message";

export interface IGroupBase {
  id: string;
  name: string;
  description: string | undefined;
  avatar: string | undefined;
}

export interface IGroupPreview extends IGroupBase {
  members: IMember[];
}

export interface IGroupHistory extends IGroupBase {
  messages: IMessage[];
}

export type IGroupMessagesMembers = IGroupPreview & IGroupHistory;

export interface IGroupSettings extends IGroupBase {
  phone: boolean;
  email: boolean;
}

export interface IGroupMetaDetails {
  addedGroups: string[];
  addedContacts: string[];
}

export interface IGroup
  extends IGroupPreview,
    IGroupSettings,
    IGroupHistory,
    IGroupMetaDetails {}

export const groupRouter = createTRPCRouter({
  // create: protectedProcedure
  //   .input(z.object({ name: z.string().min(1) }))
  //   .mutation(async ({ ctx, input }) => {
  //     // simulate a slow db call
  //     await new Promise((resolve) => setTimeout(resolve, 1000));

  //     return ctx.db.post.create({
  //       data: {
  //         name: input.name,
  //         createdBy: { connect: { id: ctx.session.user.id } },
  //       },
  //     });
  //   }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.group.findMany({
      include: {
        members: true,
        messages: {
          select: { sentAt: true, content: true },
          where: { sentAt: { not: undefined } },
          orderBy: { sentAt: "desc" },
          take: 1,
        },
      },
    });
  }),

  getLatest: publicProcedure
    .input(z.string().optional())
    .query(async ({ ctx }) => {
      return await ctx.db.group.findMany({
        include: {
          members: true,
          messages: true,
        },
      });
      //   return !!input
      //     ? groups.filter((group) =>
      //         group.name.toLowerCase().includes(input.toLowerCase()),
      //       )
      //     : groups;
    }),

  getRecentGroups: publicProcedure
    .input(z.string().optional())
    .query(async ({ ctx }) => {
      return await ctx.db.group.findMany({
        include: {
          members: true,
          messages: true,
        },
      });
    }),

  getGroupSettings: publicProcedure.input(z.string()).query(async ({ ctx }) => {
    return await ctx.db.group.findMany({
      include: {
        members: true,
        messages: true,
      },
    });
  }),

  getGroupHistory: publicProcedure.input(z.string()).query(async ({ ctx }) => {
    return await ctx.db.group.findMany({
      include: {
        members: true,
        messages: true,
      },
    });
  }),

  getGroupMembers: publicProcedure.input(z.string()).query(async ({ ctx }) => {
    return await ctx.db.group.findMany({
      include: {
        members: true,
        messages: true,
      },
    });
  }),

  getGroupData: publicProcedure.input(z.string()).query(async ({ ctx }) => {
    return await ctx.db.group.findFirst({
      include: {
        members: true,
        messages: true,
      },
    });
  }),
});
