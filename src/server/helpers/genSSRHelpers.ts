import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "../api/root";
import SuperJSON from "superjson";
import { db } from "../db";

export const genSSRHelpers = () =>
  createServerSideHelpers({
    router: appRouter,
    ctx: { db, session: null },
    transformer: SuperJSON,
  });
