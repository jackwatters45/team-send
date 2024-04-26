import type { TRPCClientErrorBase } from "@trpc/client";
import type { DefaultErrorShape } from "@trpc/server";

import ErrorComponent from "@/components/error/ErrorComponent";
import NotFound from "@/components/error/NotFound";

export const renderErrorComponent = <T extends DefaultErrorShape>(
  error: TRPCClientErrorBase<T> | null,
) => {
  if (!error?.data) return <ErrorComponent />;

  if (error.data.httpStatus === 404) return <NotFound />;

  return <ErrorComponent error={error} />;
};
