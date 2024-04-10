import debug from "debug";
import { google } from "googleapis";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { userSettingsSchema } from "@/lib/schemas/userSettingsSchema";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { useRateLimit } from "@/server/helpers/rateLimit";
import { handleError } from "@/server/helpers/handleError";
import { env } from "@/env";
import { smsFormSchema } from "@/lib/schemas/smsSchema";
import { z } from "zod";

const GoogleOAuth2 = google.auth.OAuth2;

const log = debug("team-send:api:user");

export const userRouter = createTRPCRouter({
  getCurrentUser: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user.id;

    if (!userId) return null;

    await useRateLimit(userId);

    return await ctx.db.user.findUnique({
      where: { id: userId },
      include: { emailConfig: true, smsConfig: true, groupMeConfig: true },
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
  connectEmail: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    try {
      await useRateLimit(userId);

      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        include: { account: true, emailConfig: true },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `User with id ${userId} not found`,
        });
      }

      if (!!user.emailConfig) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Email is already connected`,
        });
      }

      const oauth2Client = new GoogleOAuth2(
        env.GOOGLE_ID_DEV,
        env.GOOGLE_SECRET_DEV,
        "http://localhost:3000/account/settings",
      );

      const scopes = [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/gmail.send",
      ];

      const authorizationUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
        prompt: "consent",
        include_granted_scopes: true,
      });

      return authorizationUrl;
    } catch (error) {
      throw handleError(error);
    }
  }),
  disconnectEmail: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    try {
      await useRateLimit(userId);

      return await ctx.db.emailConfig.delete({
        where: { userId: userId },
      });
    } catch (error) {
      throw handleError(error);
    }
  }),
  connectSms: protectedProcedure
    .input(smsFormSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        await useRateLimit(userId);

        const user = await ctx.db.user.findUnique({
          where: { id: userId },
          include: { smsConfig: true },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `User with id ${userId} not found`,
          });
        }

        if (!!user.smsConfig) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `SMS already connected`,
          });
        }

        return await ctx.db.smsConfig.create({
          data: {
            user: { connect: { id: userId } },
            accountSid: input.accountSid,
            authToken: input.authToken,
            phoneNumber: input.phoneNumber,
          },
        });
      } catch (error) {
        throw handleError(error);
      }
    }),
  connectSmsDefault: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    try {
      await useRateLimit(userId);

      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        include: { smsConfig: true },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `User with id ${userId} not found`,
        });
      }

      if (!!user.smsConfig) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `SMS already connected`,
        });
      }

      return await ctx.db.smsConfig.create({
        data: {
          user: { connect: { id: userId } },
          accountSid: env.TWILIO_ACCOUNT_SID,
          authToken: env.TWILIO_AUTH_TOKEN,
          phoneNumber: env.TWILIO_PHONE_NUMBER,
          isDefault: true,
        },
      });
    } catch (error) {
      throw handleError(error);
    }
  }),
  disconnectSms: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    try {
      await useRateLimit(userId);

      return await ctx.db.smsConfig.delete({
        where: { userId: userId },
      });
    } catch (error) {
      throw handleError(error);
    }
  }),
  connectGroupMe: protectedProcedure
    .input(z.object({ accessToken: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      try {
        await useRateLimit(userId);

        return await ctx.db.groupMeConfig.upsert({
          where: { userId },
          update: { accessToken: input.accessToken },
          create: {
            accessToken: input.accessToken,
            user: { connect: { id: userId } },
          },
        });
      } catch (error) {
        throw handleError(error);
      }
    }),
  disconnectGroupMe: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    try {
      await useRateLimit(userId);

      return await ctx.db.groupMeConfig.delete({
        where: { userId: userId },
      });
    } catch (error) {
      throw handleError(error);
    }
  }),
});
