import { z } from "zod";
import { faker } from "@faker-js/faker";

import sampleMessages from "./messages.json";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { contacts, type IMember } from "./contact";
import { mockAsyncFetch } from "@/lib/mockAsyncFetch";
import { type IMessage } from "./message";

export interface IGroupBase {
  id: string;
  name: string;
  description: string | undefined;
  avatar: string | undefined;
}

export interface IGroupPreview extends IGroupBase {
  lastMessage: string;
  lastMessageTime: Date;
  members: IMember[];
}

export interface IGroupHistory extends IGroupBase {
  messages: IMessage[];
}

export interface IGroupSettings extends IGroupBase {
  phone: boolean;
  email: boolean;
}

export interface IGroupMetaDetails {
  addedGroups: string[];
  addedContacts: string[];
}

export interface IGroup
  extends IGroupPreview,
    IGroupSettings,
    IGroupHistory,
    IGroupMetaDetails {}

const messages: IMessage[] = sampleMessages as IMessage[];

const groups: IGroup[] = [
  {
    id: "1",
    name: "Blue Ballers",
    description: "A group of people who like to play basketball",
    avatar:
      "https://res.cloudinary.com/drheg5d7j/image/upload/v1704262668/ku0gvvqrrdro5p3nnuvj.png",
    lastMessage: "Some message: Do this do that etc etc",
    lastMessageTime: faker.date.recent(),
    members: contacts,
    phone: true,
    email: true,
    messages,
    addedGroups: [],
    addedContacts: [],
  },
  {
    id: "2",
    name: "Barbary Coast",
    description: "A group of people who like to play basketball",
    avatar: undefined,
    lastMessage: "Some other message .....",
    lastMessageTime: faker.date.recent(),
    members: contacts,
    phone: true,
    email: false,
    messages,
    addedGroups: [],
    addedContacts: [],
  },
  {
    id: "3",
    name: "Tech Talk",
    description: "Discussions about the latest tech trends",
    avatar: "https://images.unsplash.com/photo-1491553892222-55e07d5d8b73",
    lastMessage: "What do you think about the new framework?",
    lastMessageTime: faker.date.recent(),
    members: contacts,
    phone: false,
    email: true,
    messages,
    addedGroups: [],
    addedContacts: [],
  },
  {
    id: "4",
    name: "Foodies Unite",
    description: "Sharing recipes, restaurant tips, and food adventures",
    avatar: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    lastMessage: "Anyone know a good sushi place?",
    lastMessageTime: faker.date.recent(),
    members: contacts,
    phone: false,
    email: false,
    messages,
    addedGroups: [],
    addedContacts: [],
  },
  {
    id: "5",
    name: "Bookworms",
    description: "Discussing our favorite books and authors",
    avatar: "https://images.unsplash.com/photo-1550684376-efcbd6e3f03a",
    lastMessage: "What's everyone reading this month?",
    lastMessageTime: faker.date.recent(),
    members: contacts,
    phone: true,
    email: true,
    messages,
    addedGroups: [],
    addedContacts: [],
  },
  {
    id: "6",
    name: "Travel Enthusiasts",
    description: "Planning trips and sharing travel experiences",
    avatar: "https://images.unsplash.com/photo-1470240731273-7821a6eebc7c",
    lastMessage: "Dream destination ideas?",
    lastMessageTime: faker.date.recent(),
    members: contacts,
    phone: true,
    email: false,
    messages,
    addedGroups: [],
    addedContacts: [],
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
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.group.findMany({
      include: { members: true },
    });
  }),

  getLatest: publicProcedure.input(z.string().optional()).query(({ input }) => {
    return !!input
      ? groups.filter((group) =>
          group.name.toLowerCase().includes(input.toLowerCase()),
        )
      : groups;
  }),

  getRecentGroups: publicProcedure
    .input(z.string().optional())
    .query(async ({ input }) => {
      await mockAsyncFetch(groups, 1000);
      // TODO needs to filter out groups that have already been added but will be done in query
      return !!input
        ? groups.filter((group) =>
            group.name.toLowerCase().includes(input.toLowerCase()),
          )
        : groups;
    }),

  getGroupSettings: publicProcedure.input(z.string()).query(({ input }) => {
    return groups.find((group) => group.id === input) as IGroupSettings;
  }),

  getGroupHistory: publicProcedure.input(z.string()).query(({ input }) => {
    return groups.find((group) => group.id === input) as IGroupHistory;
  }),

  getGroupMembers: publicProcedure.input(z.string()).query(({ input }) => {
    return groups.find((group) => group.id === input)?.members ?? [];
  }),

  getGroupData: publicProcedure.query(() => {
    return groups[0];
  }),
});
