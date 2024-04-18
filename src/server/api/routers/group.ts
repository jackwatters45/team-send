import { z } from "zod";
import debug from "debug";
import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import type { MemberWithContact } from "./member";
import { handleError } from "@/server/helpers/handleError";
import { useRateLimit } from "@/server/helpers/rateLimit";
import type { GetGroupByIdReturn } from "./types/groupMeApi";
import {
  createGroupSchema,
  groupMembersFormSchema,
  groupSettingsSchema,
} from "@/schemas/groupSchema";

const log = debug("team-send:api:group");

export interface GroupPreview {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  members: MemberWithContact[];
}

export const groupRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    try {
      await useRateLimit(userId);

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
    } catch (err) {
      throw handleError(err);
    }
  }),
  getGroupHistoryById: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        await useRateLimit(userId);

        const groupBasicInfo = await ctx.db.group.findUnique({
          where: { id: input.groupId, createdBy: { id: userId } },
          select: { id: true, name: true, description: true },
        });

        if (!groupBasicInfo) throw throwGroupNotFoundError(input.groupId);

        const messages = await ctx.db.message.findMany({
          where: { groupId: input.groupId },
          include: {
            sentBy: true,
            recipients: { include: { member: { include: { contact: true } } } },
            reminders: true,
          },
        });

        return { group: groupBasicInfo, messages };
      } catch (err) {
        throw handleError(err);
      }
    }),
  getGroupById: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        await useRateLimit(userId);

        const group = await ctx.db.group.findUnique({
          where: { id: input.groupId, createdBy: { id: userId } },
          include: {
            members: { include: { contact: true } },
            messages: { include: { sentBy: true } },
          },
        });

        if (!group) throw throwGroupNotFoundError(input.groupId);

        return group;
      } catch (err) {
        throw handleError(err);
      }
    }),
  getGroupSettingsById: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        await useRateLimit(userId);

        const group = await ctx.db.group.findUnique({
          where: { id: input.groupId, createdBy: { id: userId } },
          select: {
            id: true,
            name: true,
            description: true,
            image: true,
            useSMS: true,
            useEmail: true,
            groupMeId: true,
            useGroupMe: true,
          },
        });

        if (!group) throw throwGroupNotFoundError(input.groupId);

        const userConnections = await ctx.db.user.findUnique({
          where: { id: userId },
          select: { groupMeConfig: true, emailConfig: true, smsConfig: true },
        });

        if (!userConnections) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to retrieve user connections",
          });
        }

        return {
          ...group,
          isGroupMeConfig: !!userConnections.groupMeConfig,
          isSMSConfig: !!userConnections.smsConfig,
          isEmailConfig: !!userConnections.emailConfig,
        };

        return;
      } catch (err) {
        throw handleError(err);
      }
    }),
  getRecentGroups: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        addedGroupIds: z.array(z.string()).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        await useRateLimit(userId);

        if (!input.search) {
          return await ctx.db.group.findMany({
            where: {
              id: { notIn: input.addedGroupIds },
              createdBy: { id: userId },
            },
            include: { members: { select: { contact: true } } },
            take: 10,
            orderBy: { updatedAt: "desc" },
          });
        } else {
          return await ctx.db.group.findMany({
            where: {
              name: { contains: input.search, mode: "insensitive" },
              id: { notIn: input.addedGroupIds },
              createdBy: { id: userId },
            },
            include: { members: { select: { contact: true } } },
            take: 10,
            orderBy: { updatedAt: "desc" },
          });
        }
      } catch (error) {
        throw handleError(error);
      }
    }),
  create: protectedProcedure
    .input(createGroupSchema)
    .mutation(
      async ({
        ctx,
        input: { changeGlobalEmail, changeGlobalSms, ...data },
      }) => {
        const userId = ctx.session.user.id;

        log(data.image);
        try {
          await useRateLimit(userId);

          const result = await ctx.db.$transaction(async (prisma) => {
            const members = await Promise.all(
              data.members
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
                ...data,
                members: {
                  create: members.map((member) => ({
                    ...member,
                    createdBy: { connect: { id: userId } },
                    lastUpdatedBy: { connect: { id: userId } },
                  })),
                },
                createdBy: { connect: { id: userId } },
              },
            });

            if (changeGlobalEmail) {
              const updateAll = await prisma.group.updateMany({
                where: { createdBy: { id: userId } },
                data: { useEmail: data.useEmail },
              });

              if (!updateAll) {
                throw new TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: "Failed to update all group connections",
                });
              }
            }

            if (changeGlobalSms) {
              const updateAll = await prisma.group.updateMany({
                where: { createdBy: { id: userId } },
                data: { useSMS: data.useSMS },
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
          throw handleError(err);
        }
      },
    ),
  delete: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        await useRateLimit(userId);

        return await ctx.db.group.delete({
          where: { id: input.groupId, createdBy: { id: userId } },
        });
      } catch (err) {
        throw handleError(err);
      }
    }),
  archive: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        await useRateLimit(userId);

        const archivedGroup = await ctx.db.group.update({
          where: { id: input.groupId, createdBy: { id: userId } },
          data: { isArchived: true },
        });

        if (!archivedGroup) throw throwGroupNotFoundError(input.groupId);

        return archivedGroup;
      } catch (err) {
        throw handleError(err);
      }
    }),
  updateSettings: protectedProcedure
    .input(groupSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        await useRateLimit(userId);

        const result = await ctx.db.$transaction(async (prisma) => {
          const group = await prisma.group.update({
            where: { id: input.groupId, createdById: userId },
            data: {
              name: input.name,
              description: input.description,
              useSMS: input.useSMS,
              useEmail: input.useEmail,
            },
          });

          if (!group) throw throwGroupNotFoundError(input.groupId);

          if (input.changeGlobalEmail) {
            const updateAll = await prisma.group.updateMany({
              where: { createdBy: { id: userId } },
              data: { useEmail: input.useEmail },
            });

            if (!updateAll) {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to update all group connections",
              });
            }
          }

          if (input.changeGlobalSms) {
            const updateAll = await prisma.group.updateMany({
              where: { createdBy: { id: userId } },
              data: { useSMS: input.useSMS },
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
        throw handleError(err);
      }
    }),
  checkGroupMeId: protectedProcedure
    .input(z.object({ groupMeId: z.string() }))
    .mutation(async ({ ctx, input: { groupMeId } }) => {
      const userId = ctx.session.user.id;

      try {
        await useRateLimit(userId);

        return await getGroupMeGroup({
          userId,
          db: ctx.db,
          groupMeId,
          throwErrorOnFail: false,
        });
      } catch (err) {
        throw handleError(err);
      }
    }),
  saveGroupMeId: protectedProcedure
    .input(z.object({ groupId: z.string(), groupMeId: z.string() }))
    .mutation(async ({ ctx, input: { groupId, groupMeId } }) => {
      const userId = ctx.session.user.id;

      try {
        await useRateLimit(userId);

        await getGroupMeGroup({ userId, db: ctx.db, groupMeId });

        const group = await ctx.db.group.update({
          where: { id: groupId, createdById: userId },
          data: { groupMeId: groupMeId },
        });

        if (!group) throw throwGroupNotFoundError(groupId);

        return group;
      } catch (err) {
        throw handleError(err);
      }
    }),
  updateMembers: protectedProcedure
    .input(groupMembersFormSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        await useRateLimit(userId);

        const group = await ctx.db.group.findUnique({
          where: { id: input.groupId, createdById: userId },
          include: { members: true },
        });
        if (!group) throw throwGroupNotFoundError(input.groupId!);

        const result = await ctx.db.$transaction(async (prisma) => {
          if (input.addedGroupIds !== group.addedGroupIds) {
            await prisma.group.update({
              where: { id: input.groupId, createdById: userId },
              data: { addedGroupIds: input.addedGroupIds },
            });
          }

          const existingMemberIds = group.members.map(({ id }) => id);
          const updatedMemberIds = input.members.map(({ id }) => id);
          const memberIdsToDelete = existingMemberIds.filter(
            (id) => !updatedMemberIds.includes(id),
          );

          await prisma.member.deleteMany({
            where: { id: { in: memberIdsToDelete } },
          });

          const updatedGroup = await prisma.group.update({
            where: { id: input.groupId, createdById: userId },
            data: { addedGroupIds: input?.addedGroupIds },
          });

          const memberUpserts = await Promise.all(
            input.members.map(async ({ contact, ...member }) => {
              const contactUpsert = await prisma.contact.upsert({
                where: { id: contact.id, createdById: userId },
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
                  createdBy: { connect: { id: userId } },
                  lastUpdatedBy: { connect: { id: userId } },
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
        throw handleError(err);
      }
    }),
});

function throwGroupNotFoundError(groupId: string) {
  return new TRPCError({
    code: "NOT_FOUND",
    message: `Group with id "${groupId}" not found`,
  });
}

async function getGroupMeGroup({
  userId,
  groupMeId,
  db,
  throwErrorOnFail = true,
}: {
  userId: string;
  groupMeId?: string;
  db: PrismaClient;
  throwErrorOnFail?: boolean;
}) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { groupMeConfig: true },
  });

  const groupMeAccessToken = user?.groupMeConfig?.accessToken;

  const res = await fetch(
    `https://api.groupme.com/v3/groups/${groupMeId}?token=${groupMeAccessToken}`,
  );

  if (!res.ok) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid GroupMe ID",
    });
  }

  const groupMeData = (await res.json()) as GetGroupByIdReturn | null;

  if (!groupMeData && throwErrorOnFail) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid GroupMe ID",
    });
  }

  return { id: groupMeId, ...groupMeData };
}
