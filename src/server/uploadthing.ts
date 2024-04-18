import { createUploadthing, type FileRouter } from "uploadthing/next-legacy";
import { UploadThingError } from "uploadthing/server";
import { getServerAuthSession } from "./auth";
import { db } from "./db";
import { z } from "zod";

const f = createUploadthing();

export const ourFileRouter = {
  userAvatar: f(["image"]) // TODO add maxFileSize
    .middleware(async (ctx) => {
      const session = await getServerAuthSession(ctx);

      if (!session) throw new UploadThingError("Unauthorized");

      return { userId: session?.user.id };
    })
    .onUploadComplete(async (data) => {
      await db.user.update({
        where: { id: data.metadata.userId },
        data: { image: data.file.url },
      });
    }),

  groupAvatar: f(["image"])
    .input(z.object({ groupId: z.string().optional() }))
    .middleware(async (ctx) => {
      const session = await getServerAuthSession(ctx);

      if (!session) throw new UploadThingError("Unauthorized");

      return { groupId: ctx.input.groupId, userId: session?.user.id };
    })
    .onUploadComplete(async (data) => {
      if (!data.metadata.groupId) return;

      await db.group.update({
        where: { id: data.metadata.groupId, createdById: data.metadata.userId },
        data: { image: data.file.url },
      });
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
