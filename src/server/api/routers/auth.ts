import { Ratelimit } from "@upstash/ratelimit";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";
import debug from "debug";
import { userSettingsSchema } from "@/lib/schemas/userSettingsSchema";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

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

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "10 s"),
  analytics: true,
});

export const authRouter = createTRPCRouter({
  getCurrentUser: publicProcedure.query(({ ctx }) => {
    const userId = ctx.session?.user.id;

    if (!userId) {
      return null;
    }

    return ctx.db.user.findUnique({
      where: { id: userId },
    });
  }),
  updateProfile: protectedProcedure
    .input(userSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const { success } = await ratelimit.limit(userId);
      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      try {
        const updatedUser = await ctx.db.user.update({
          where: { id: ctx.session.user.id },
          data: input,
        });

        if (!updatedUser) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        return updatedUser;
      } catch (error) {
        log(error);

        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Username "${input.username}" is already taken. Please choose a different one.`,
            });
          } else {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: error.message,
            });
          }
        } else {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }
    }),
});
