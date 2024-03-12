import { createTRPCRouter, publicProcedure } from "../trpc";

export const authRouter = createTRPCRouter({
  getCurrentUser: publicProcedure.query(() => {
    return {
      id: "1",
      name: "Jack Watters",
      avatar: "https://randomuser.me/api/portraits",
    };
  }),
});
