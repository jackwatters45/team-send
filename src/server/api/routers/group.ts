import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

type Recipient = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

// TODO 
export type GroupPreview = {
  id: string;
  name: string;
  avatar: string | undefined;
  lastMessage: string;
  lastMessageTime: Date;
  recipients: Recipient[];
};

const groups: GroupPreview[] = [
  {
    id: "1",
    name: "Blue Ballers",
    avatar: "https://res.cloudinary.com/drheg5d7j/image/upload/v1704262668/ku0gvvqrrdro5p3nnuvj.png",
    lastMessage: "Some message: Do this do that etc etc",
    lastMessageTime: new Date(),
    recipients: [],
  },
  {
    id: "2",
    name: "Barbary Coast",
    avatar: undefined,
    lastMessage: "Some other message .....",
    lastMessageTime: new Date(),
    recipients: [],
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

  getLatest: publicProcedure.query(() => {
    return groups;
  }),
});
