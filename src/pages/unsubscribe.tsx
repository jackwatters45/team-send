import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";

import { Button } from "@/components/ui/button";
import Layout from "@/layouts/Layout";

export default function Unsubscribe({
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Layout>
      <section className="container flex w-full max-w-screen-sm flex-col items-center gap-8 px-8 py-24 sm:px-16 md:py-32">
        <div className="space-y-2 text-center">
          <h1 className="loading-text text-3xl font-bold tracking-tighter sm:text-4xl">
            Unsubscribing from mailing list<span>.</span>
            <span>.</span>
            <span>.</span>
          </h1>
          <p className="text-mate-muted-dark dark:text-mate-muted-light max-w-[600px]">
            If you are not redirected in a few seconds, please click the button
            below.
          </p>
        </div>
        <div className="flex w-full flex-col justify-between text-center sm:flex-row-reverse">
          <Button
            type="button"
            id="unsubscribe-button"
            variant={"outline"}
            data-error={error}
          >
            Unsubscribe
          </Button>
          {error && (
            <p className="mt-2 text-sm text-red-500 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
      </section>
    </Layout>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext<{ error: string | undefined }>,
) => {
  const email = context.query.email;

  if (!email || typeof email !== "string")
    return { redirect: { destination: "/", permanent: false } };

  // remove email from mailing list
  const res = await fetch(
    `http://localhost:3000/api/mailing-list?email=${encodeURIComponent(email)}`,
  );

  // if successful, redirect to login page
  if (res.status === 302)
    return { redirect: { destination: "/", permanent: false } };

  const data = (await res.json()) as { message: string | undefined };

  const error = data?.message ?? null;

  return {
    props: {
      error,
    },
  };
};
