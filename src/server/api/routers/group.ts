import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import type { IUser } from "./user";

// TODO
export interface IGroupPreview {
  id: string;
  name: string;
  description: string | undefined;
  avatar: string | undefined;
  lastMessage: string;
  lastMessageTime: Date;
  members: IUser[];
}

export interface IGroup extends IGroupPreview {
  messages: {
    id: string;
    content: string;
    sender: IUser;
    time: Date;
  }[];
}

const users: IUser[] = [
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

const groups: IGroupPreview[] = [
  {
    id: "1",
    name: "Blue Ballers",
    description: "A group of people who like to play basketball",
    avatar:
      "https://res.cloudinary.com/drheg5d7j/image/upload/v1704262668/ku0gvvqrrdro5p3nnuvj.png",
    lastMessage: "Some message: Do this do that etc etc",
    lastMessageTime: new Date(),
    members: users,
  },
  {
    id: "2",
    name: "Barbary Coast",
    description: "A group of people who like to play basketball",
    avatar: undefined,
    lastMessage: "Some other message .....",
    lastMessageTime: new Date(),
    members: users,
  },
];

export const groupRouter = createTRPCRouter({
  // create: protectedProcedure
  //   .input(z.object({ name: z.string().min(1) }))
  //   .mutation(async ({ ctx, input }) => {
  //     // simulate a slow db call
  //     await new Promise((resolve) => setTimeout(resolve, 1000));

  //     return ctx.db.post.create({
  //       data: {
  //         name: input.name,
  //         createdBy: { connect: { id: ctx.session.user.id } },
  //       },
  //     });
  //   }),

  getLatest: publicProcedure
  .input(z.string().optional())
  .query(() => {
    return groups;
  }),

  getGroupData: publicProcedure.query(() => {
    return groups[0];
  }),
});
