import Link from "next/link";
import { useRouter } from "next/router";

import type { TRPCClientErrorBase } from "@trpc/client";
import type { DefaultErrorShape } from "@trpc/server";

import { Button } from "../ui/button";
import Layout from "@/layouts/Layout";

export default function Error<T extends DefaultErrorShape>({
  error,
}: {
  error?: TRPCClientErrorBase<T>;
}) {
  const router = useRouter();
  const handleGoBack = () => router.back();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center space-y-4 py-16 text-center md:py-28 lg:py-36">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Server Error
            {error?.data?.httpStatus ? `: ${error.data.httpStatus}` : ""}
          </h1>
          <p className="max-w-[600px] text-stone-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-stone-400">
            Sorry, we couldn&apos;t load the page. Please try again in a few
            moments.
          </p>
        </div>
        <div className="space-x-4 ">
          <Button variant="outline">
            <Link href="/">Go home</Link>
          </Button>
          <Button variant="outline" onClick={handleGoBack}>
            Go back
          </Button>
        </div>
      </div>
    </Layout>
  );
}
