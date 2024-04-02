import debug from "debug";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";

const log = debug("team-send:api:handleError");

export function handleError(error: unknown) {
  log("An unexpected error occurred: %O", error);
  console.error(error);

  if (error instanceof TRPCError) throw error;

  if (error instanceof PrismaClientKnownRequestError) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `An unexpected database error occurred: ${error.message}`,
      cause: error,
    });
  }

  if (error instanceof Error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `An unexpected error occurred: ${error.message}`,
      cause: error,
    });
  }

  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: `An unexpected error occurred: ${error}`,
    cause: error,
  });
}
