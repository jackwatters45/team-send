import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import debug from "debug";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { type Member } from "./contact";

import { type Message } from "./message";
import { TRPCError } from "@trpc/server";
import { createGroupSchema } from "@/lib/schemas/createGroupSchema";
import { groupMembersFormSchema } from "@/lib/schemas/groupMembersFormSchema";
import { groupSettingsSchema } from "@/lib/schemas/groupSettingsSchema";

const log = debug("team-send:api:group");

export interface IGroupBase {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
}

export interface IGroupPreview extends IGroupBase {
  members: Member[];
}

export interface IGroupHistory extends IGroupBase {
  messages: Message[];
}

export interface IGroupSettings extends IGroupBase {
  usePhone: boolean;
  useEmail: boolean;
}

export interface IGroupMetaDetails {
  addedGroupIds: string[];
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
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    return await ctx.db.group.findMany({
      where: { createdBy: { id: userId } },
      include: {
        members: {
          include: { contact: true },
        },
        messages: {
          select: { sendAt: true, content: true },
          where: { sendAt: { not: undefined } },
          orderBy: { sendAt: "desc" },
          take: 1,
        },
      },
    });
  }),
  getGroupHistoryById: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const groupBasicInfo = await ctx.db.group.findUnique({
        where: { id: input.groupId },
        select: { id: true, name: true, description: true },
      });

      const messages = await ctx.db.message.findMany({
        where: { groupId: input.groupId },
        include: {
          sentBy: true,
          recipients: { include: { contact: true } },
          reminders: true,
        },
      });

      if (!groupBasicInfo) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" });
      }

      return { group: groupBasicInfo, messages };
    }),
  getGroupById: protectedProcedure
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
  getRecentGroups: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        addedGroupIds: z.array(z.string()).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!input.search) {
        return await ctx.db.group.findMany({
          where: { id: { notIn: input.addedGroupIds } },
          include: { members: { select: { contact: true } } },
          take: 10,
          orderBy: { updatedAt: "desc" },
        });
      } else {
        return await ctx.db.group.findMany({
          where: {
            name: { contains: input.search, mode: "insensitive" },
            id: { notIn: input.addedGroupIds },
          },
          include: { members: { select: { contact: true } } },
          take: 10,
          orderBy: { updatedAt: "desc" },
        });
      }
    }),
  create: protectedProcedure
    .input(createGroupSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const { success } = await ratelimit.limit(userId);
      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      try {
        const result = await ctx.db.$transaction(async (prisma) => {
          const members = await Promise.all(
            input.members
              .filter((member) => member.contact.name)
              .map(async (member) => {
                if (member.contact.id) {
                  // TODO improvement: prevent redundant contact updates
                  await prisma.contact.upsert({
                    where: { id: member.contact.id, createdById: userId },
                    update: { ...member.contact },
                    create: {
                      ...member.contact,
                      createdBy: { connect: { id: userId } },
                    },
                  });

                  return {
                    contact: { connect: { id: member.contact.id } },
                    memberNotes: member.memberNotes,
                    isRecipient: member.isRecipient,
                  };
                } else {
                  const contact = await prisma.contact.create({
                    data: {
                      ...member.contact,
                      createdBy: { connect: { id: userId } },
                    },
                  });

                  return {
                    contact: { connect: { id: contact.id } },
                    memberNotes: member.memberNotes,
                    isRecipient: member.isRecipient,
                  };
                }
              }),
          );

          const group = await prisma.group.create({
            data: {
              ...input,
              members: { create: members },
              createdBy: { connect: { id: ctx.session.user.id } },
            },
          });

          return group;
        });

        return result;
      } catch (err) {
        console.error(err);
        throw err;
      }
    }),

  delete: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const { success } = await ratelimit.limit(userId);
      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      return await ctx.db.group.delete({
        where: { id: input.groupId },
      });
    }),
  archive: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const { success } = await ratelimit.limit(userId);
      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const archivedGroup = await ctx.db.group.update({
        where: { id: input.groupId },
        data: { isArchived: true },
      });

      if (!archivedGroup) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" });
      }

      return archivedGroup;
    }),

  updateSettings: protectedProcedure
    .input(groupSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const { success } = await ratelimit.limit(userId);
      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      try {
        const result = await ctx.db.$transaction(async (prisma) => {
          const group = await prisma.group.update({
            where: { id: input.groupId },
            data: {
              name: input.name,
              description: input.description,
              image: input.imageFile ?? input.image,
              usePhone: input.usePhone,
              useEmail: input.useEmail,
            },
          });

          if (!group) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Group not found",
            });
          }

          if (input["change-global"]) {
            const updateAll = await prisma.group.updateMany({
              where: { createdBy: { id: userId } },
              data: {
                usePhone: input.usePhone,
                useEmail: input.useEmail,
              },
            });

            if (!updateAll) {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to update all group connections",
              });
            }
          }

          return group;
        });

        return result;
      } catch (err) {
        console.error(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  updateMembers: protectedProcedure
    .input(groupMembersFormSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const { success } = await ratelimit.limit(userId);
      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const group = await ctx.db.group.findUnique({
        where: { id: input.groupId },
        include: { members: true },
      });

      if (!group) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      try {
        const result = await ctx.db.$transaction(async (prisma) => {
          if (input.addedGroupIds !== group.addedGroupIds) {
            await prisma.group.update({
              where: { id: input.groupId },
              data: { addedGroupIds: input.addedGroupIds },
            });
          }

          const existingMemberIds = group.members.map(({ id }) => id);
          const updatedMemberIds = input.members.map(({ id }) => id);
          const memberIdsToDelete = existingMemberIds.filter(
            (id) => !updatedMemberIds.includes(id),
          );

          await prisma.member.deleteMany({
            where: {
              id: { in: memberIdsToDelete },
            },
          });

          const updatedGroup = await prisma.group.update({
            where: { id: input.groupId },
            data: { addedGroupIds: input?.addedGroupIds },
          });

          const memberUpserts = await Promise.all(
            input.members.map(async ({ contact, ...member }) => {
              const contactUpsert = await prisma.contact.upsert({
                where: { id: contact.id },
                update: { ...contact },
                create: { ...contact, createdBy: { connect: { id: userId } } },
              });

              if (member?.id) {
                return prisma.member.update({
                  where: { id: member?.id },
                  data: {
                    isRecipient: member.isRecipient,
                    memberNotes: member.memberNotes,
                  },
                });
              }

              return prisma.member.create({
                data: {
                  isRecipient: member.isRecipient,
                  memberNotes: member.memberNotes,
                  contact: { connect: { id: contactUpsert.id } },
                  group: { connect: { id: input.groupId } },
                },
              });
            }),
          );

          return {
            members: memberUpserts,
            ...updatedGroup,
          };
        });

        return result;
      } catch (err) {
        console.error(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
