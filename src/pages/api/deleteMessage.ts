// pages/api/deleteMessage.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";
import { verifySignature } from "@upstash/qstash/dist/nextjs";
import { TRPCError } from "@trpc/server";
import debug from "debug";

import { env } from "@/env";
import type { MessageWithContactsAndReminders } from "@/server/api/routers/message";
import { handleError } from "@/server/helpers/handleError";

const log = debug("team-send:pages:api:deleteMessage");

export const upstash = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

export type SendMessageBody = {
  message: MessageWithContactsAndReminders;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { message } = req.body as { message: MessageWithContactsAndReminders };

  try {
    log("Deleting message", message.id);
  } catch (err) {
    throw handleError(err);
  }

  res.status(200).json({ message: "Message deleted successfully" });
}
export default verifySignature(handler);

export const config = { api: { bodyParser: false } };
