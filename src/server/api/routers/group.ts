import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { type IUser, members } from "./user";

import { faker } from "@faker-js/faker";

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

const groups: IGroupPreview[] = [
  {
    id: "1",
    name: "Blue Ballers",
    description: "A group of people who like to play basketball",
    avatar:
      "https://res.cloudinary.com/drheg5d7j/image/upload/v1704262668/ku0gvvqrrdro5p3nnuvj.png",
    lastMessage: "Some message: Do this do that etc etc",
    lastMessageTime: faker.date.recent(),
    members,
  },
  {
    id: "2",
    name: "Barbary Coast",
    description: "A group of people who like to play basketball",
    avatar: undefined,
    lastMessage: "Some other message .....",
    lastMessageTime: faker.date.recent(),
    members,
  },
  {
    id: "3",
    name: "Tech Talk",
    description: "Discussions about the latest tech trends",
    avatar: "https://images.unsplash.com/photo-1491553892222-55e07d5d8b73", // Placeholder image
    lastMessage: "What do you think about the new framework?",
    lastMessageTime: faker.date.recent(),
    members,
  },
  {
    id: "4",
    name: "Foodies Unite",
    description: "Sharing recipes, restaurant tips, and food adventures",
    avatar: "https://images.unsplash.com/photo-1504674900247-0877df9cc836", // Food-related image
    lastMessage: "Anyone know a good sushi place?",
    lastMessageTime: faker.date.recent(),
    members,
  },

  // 5th Group
  {
    id: "5",
    name: "Bookworms",
    description: "Discussing our favorite books and authors",
    avatar: "https://images.unsplash.com/photo-1550684376-efcbd6e3f03a", // Image of books
    lastMessage: "What's everyone reading this month?",
    lastMessageTime: faker.date.recent(),
    members,
  },

  // 6th Group
  {
    id: "6",
    name: "Travel Enthusiasts",
    description: "Planning trips and sharing travel experiences",
    avatar: "https://images.unsplash.com/photo-1470240731273-7821a6eebc7c", // Travel-themed image
    lastMessage: "Dream destination ideas?",
    lastMessageTime: faker.date.recent(),
    members,
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

  getLatest: publicProcedure.input(z.string().optional()).query(({ input }) => {
    return !!input
      ? groups.filter((group) =>
          group.name.toLowerCase().includes(input.toLowerCase()),
        )
      : groups;
  }),

  getGroupSettings: publicProcedure.input(z.string()).query(({ input }) => {
    return groups.find((group) => group.id === input);
  }),

  getGroupMembers: publicProcedure.input(z.string()).query(({ input }) => {
    return groups.find((group) => group.id === input)?.members ?? [];
  }),

  getGroupData: publicProcedure.query(() => {
    return groups[0];
  }),
});
