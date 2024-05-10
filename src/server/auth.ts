import { PrismaAdapter } from "@auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
	getServerSession,
	type DefaultSession,
	type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";

import { env } from "@/env";
import { db } from "@/server/db";

import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
	interface Session extends DefaultSession {
		user: DefaultSession["user"] & {
			id: string;
			username?: string;
			// ...other properties
			// role: UserRole;
		};
	}

	interface User {
		username?: string;
		// ...other properties
		// role: UserRole;
	}
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
	callbacks: {
		session: ({ session, user }) => ({
			...session,
			user: {
				...session.user,
				id: user.id,
				name: user.name,
				image: user.image,
				username: user.username,
			},
		}),
	},
	adapter: PrismaAdapter(db) as Adapter,
	providers: [
		GithubProvider({
			clientId:
				env.NODE_ENV === "development" ? env.GITHUB_ID_DEV : env.GITHUB_ID_PROD,
			clientSecret:
				env.NODE_ENV === "development"
					? env.GITHUB_SECRET_DEV
					: env.GITHUB_SECRET_PROD,
		}),
		GoogleProvider({
			clientId:
				env.NODE_ENV === "development" ? env.GOOGLE_ID_DEV : env.GOOGLE_ID_PROD,
			clientSecret:
				env.NODE_ENV === "development"
					? env.GOOGLE_SECRET_DEV
					: env.GOOGLE_SECRET_PROD,
		}),
		FacebookProvider({
			clientId:
				env.NODE_ENV === "development" ? env.FACEBOOK_ID_DEV : env.FACEBOOK_ID_PROD,
			clientSecret:
				env.NODE_ENV === "development"
					? env.FACEBOOK_SECRET_DEV
					: env.FACEBOOK_SECRET_PROD,
		}),
	],
	pages: {
		signIn: "/login",
	},
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
	req: GetServerSidePropsContext["req"];
	res: GetServerSidePropsContext["res"];
}) => {
	return getServerSession(ctx.req, ctx.res, authOptions);
};
