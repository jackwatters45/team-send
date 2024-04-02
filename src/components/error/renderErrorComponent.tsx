import type { TRPCClientErrorBase } from "@trpc/client";
import type { DefaultErrorShape } from "@trpc/server";

import Error from "@/components/error/ErrorComponent";
import NotFound from "@/components/error/NotFound";

export const renderErrorComponent = <T extends DefaultErrorShape>(
  error: TRPCClientErrorBase<T> | null,
) => {
  if (!error?.data) return <Error />;

  if (error.data.httpStatus === 404) return <NotFound />;

  return <Error error={error} />;
};
