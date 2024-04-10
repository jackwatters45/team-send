import { createTRPCRouter } from "@/server/api/trpc";
import { groupRouter } from "./routers/group";
import { contactRouter } from "./routers/contact";
import { memberRouter } from "./routers/member";
import { userRouter } from "./routers/user";
import { messageRouter } from "./routers/message";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  group: groupRouter,
  contact: contactRouter,
  user: userRouter,
  message: messageRouter,
  member: memberRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
