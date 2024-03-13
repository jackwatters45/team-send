import { createTRPCRouter, publicProcedure } from "../trpc";

export interface IUser {
  id: string;
  name: string;
  avatar: string;
  username?: string;
}

export const authRouter = createTRPCRouter({
  getCurrentUser: publicProcedure.query(() => {
    return {
      id: "1",
      name: "Jack Watters",
      avatar: "https://randomuser.me/api/portraits",
      username: "jackwatters",
    };
  }),
});
