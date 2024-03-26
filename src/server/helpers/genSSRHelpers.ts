import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "../api/root";
import SuperJSON from "superjson";
import { db } from "../db";
import type { Session } from "next-auth";

export const genSSRHelpers = (session?: Session) =>
  createServerSideHelpers({
    router: appRouter,
    ctx: { db, session: session ?? null },
    transformer: SuperJSON,
  });
