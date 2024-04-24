import type { GetServerSideProps, InferGetServerSidePropsType } from "next";

import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";
import { getServerAuthSession } from "@/server/auth";

import Groups from "@/components/group/Groups";
import HomeLoggedOut from "@/components/HomeLoggedOut";

export default function Home({
  userId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  if (!userId) {
    return <HomeLoggedOut />;
  }

  return <Groups />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession(context);
  if (!session) {
    return {
      props: {
        userId: null,
      },
    };
  }

  const helpers = genSSRHelpers(session);
  await helpers.group.getAll.prefetch();

  const userId = session.user?.id;

  return {
    props: {
      trpcState: helpers.dehydrate(),
      userId: userId ?? null,
    },
  };
};
