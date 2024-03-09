import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export interface INewUser {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface IUser extends INewUser {
  id: string;
}

const members: IUser[] = [
  {
    id: "1",
    name: "Pedro Duarte",
    email: "pedro@gmail.com",
    phone: "1234567890",
    notes: "Some notes",
  },
  {
    id: "2",
    name: "John Doe",
    email: "",
    phone: "9876543210",
    notes: "",
  },
];

export const userRouter = createTRPCRouter({
  getLatest: publicProcedure
    .input(z.string().optional())
    .query(() => {
      return members;
    }),
});
