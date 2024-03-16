import { createTRPCRouter, publicProcedure } from "../trpc";

export interface IUserDetails {
  id: string;
  name: string;
  avatar: string;
  username?: string;
  email?: string;
  phone?: string;
}

export interface IUserConnections {
  nodeMailer?: string;
  twilio?: string;
}

export interface IUser extends IUserDetails, IUserConnections {}

export const authRouter = createTRPCRouter({
  getCurrentUser: publicProcedure.query(() => {
    return {
      id: "1",
      name: "Jack Watters",
      avatar: "https://randomuser.me/api/portraits",
      username: "jackwatters",
      email: "jack.watters@me.com",
      phone: "555-555-5555",
      nodeMailer: "111",
      twilio: "222",
    };
  }),
});
