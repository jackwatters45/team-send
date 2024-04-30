import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import debug from "debug";

import { TRPCError } from "@trpc/server";

const log = debug("team-send:helpers:rateLimit");

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export const useRateLimit = async (key: string) => {
  const { success } = await ratelimit.limit(key);
  if (!success)
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message:
        "You have exceeded the maximum number of requests. Please try again later.",
    });
};
