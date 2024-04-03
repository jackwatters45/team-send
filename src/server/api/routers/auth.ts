import debug from "debug";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { userSettingsSchema } from "@/lib/schemas/userSettingsSchema";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { useRateLimit } from "@/server/helpers/rateLimit";
import { handleError } from "@/server/helpers/handleError";
import type { Message } from "./message";
import type { Group } from "./group";
import type { Contact } from "./contact";

const log = debug("team-send:api:auth");

// Auth
export interface Account {
  id: string;
  userId: string;
  type: string;
  password?: string;
  provider: string;
  providerAccountId: string;
  refreshToken?: string;
  accessToken?: string;
  expiresAt?: number;
  tokenType?: string;
  scope?: string;
  idToken?: string;
  sessionState?: string;
  user: User;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  user: User;
}

export interface VerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

// User
export interface IUserDetails {
  id: string;
  name: string;
  username?: string;
  phone?: string;
  email?: string;
  // emailVerified? : boolean;
  image: string;
}

export interface IUserConnections {
  nodeMailer?: string;
  twilio?: string;
}

export interface IUserMetaDetails {
  account: Account;
  sessions: Session[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserActivity {
  groups: string[];
  messagesSent: string[];
  messagesReceived: string[];
  messagesUpdated: string[];
}

export type User = IUserDetails &
  IUserConnections &
  IUserMetaDetails &
  IUserActivity;

export type UserExportData = {
  user: User;
  accounts: Account[];
  contacts: Contact[];
  groups: Group[];
  messagesSent: Message[];
};

export const authRouter = createTRPCRouter({
  getCurrentUser: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user.id;

    if (!userId) return null;

    await useRateLimit(userId);

    return await ctx.db.user.findUnique({
      where: { id: userId },
    });
  }),
  getExportData: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    try {
      await useRateLimit(userId);

      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        include: {
          groups: {
            include: {
              members: true,
              messages: {
                include: {
                  reminders: true,
                  recipients: true,
                },
              },
            },
          },
          contacts: true,
          account: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `User with id ${userId} not found`,
        });
      }

      return JSON.stringify(user);
    } catch (error) {
      throw handleError(error);
    }
  }),
  updateProfile: protectedProcedure
    .input(userSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        await useRateLimit(userId);

        const updatedUser = await ctx.db.user.update({
          where: { id: ctx.session.user.id },
          data: input,
        });

        if (!updatedUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `User with id ${userId} not found`,
          });
        }

        return updatedUser;
      } catch (error) {
        if (
          error instanceof PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          log("Username already taken: %O", error);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Username "${input.username}" is already taken. Please choose a different one.`,
          });
        }

        throw handleError(error);
      }
    }),
  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    try {
      await useRateLimit(userId);

      await ctx.db.user.delete({
        where: { id: userId },
      });

      return true;
    } catch (error) {
      throw handleError(error);
    }
  }),
  archiveAccount: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    try {
      await useRateLimit(userId);

      return await ctx.db.user.findUnique({
        where: { id: userId },
      });

      // await ctx.db.user.update({
      // where: { id: userId },
      // data: { isArchived: true },
      // });
    } catch (error) {
      throw handleError(error);
    }
  }),
});
