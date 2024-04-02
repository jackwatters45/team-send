import debug from "debug";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";

const log = debug("team-send:api:handleError");

export function handleError(error: unknown): TRPCError {
  log("An unexpected error occurred: %O", error);
  console.error(error);

  if (error instanceof TRPCError) return error;

  if (error instanceof PrismaClientKnownRequestError) {
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `An unexpected database error occurred: ${error.message}`,
      cause: error,
    });
  }

  if (error instanceof Error) {
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `An unexpected error occurred: ${error.message}`,
      cause: error,
    });
  }

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: `An unexpected error occurred: ${error}`,
    cause: error,
  });
}
