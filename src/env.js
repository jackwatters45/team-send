import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app isn't built with invalid env vars.
   *
   */
  server: {
    DATABASE_URL: z
      .string()
      .url()
      .refine(
        (str) => !str.includes("YOUR_MYSQL_URL_HERE"),
        "You forgot to change the default URL",
      ),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string() : z.string().url(),
    ),
    GITHUB_ID_DEV: z.string(),
    GITHUB_SECRET_DEV: z.string(),
    GITHUB_ID_PROD: z.string(),
    GITHUB_SECRET_PROD: z.string(),

    GOOGLE_ID_DEV: z.string(),
    GOOGLE_SECRET_DEV: z.string(),
    GOOGLE_ID_PROD: z.string(),
    GOOGLE_SECRET_PROD: z.string(),

    FACEBOOK_ID_DEV: z.string(),
    FACEBOOK_SECRET_DEV: z.string(),
    FACEBOOK_ID_PROD: z.string(),
    FACEBOOK_SECRET_PROD: z.string(),

    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,

    GITHUB_ID_DEV: process.env.GITHUB_ID_DEV,
    GITHUB_SECRET_DEV: process.env.GITHUB_SECRET_DEV,
    GITHUB_ID_PROD: process.env.GITHUB_ID_PROD,
    GITHUB_SECRET_PROD: process.env.GITHUB_SECRET_PROD,

    GOOGLE_ID_DEV: process.env.GOOGLE_ID_DEV,
    GOOGLE_SECRET_DEV: process.env.GOOGLE_SECRET_DEV,
    GOOGLE_ID_PROD: process.env.GOOGLE_ID_PROD,
    GOOGLE_SECRET_PROD: process.env.GOOGLE_SECRET_PROD,

    FACEBOOK_ID_DEV: process.env.FACEBOOK_ID_DEV,
    FACEBOOK_SECRET_DEV: process.env.FACEBOOK_SECRET_DEV,
    FACEBOOK_ID_PROD: process.env.FACEBOOK_ID_PROD,
    FACEBOOK_SECRET_PROD: process.env.FACEBOOK_SECRET_PROD,

    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
