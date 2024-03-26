import type { GetServerSideProps } from "next";

import { getServerAuthSession } from "@/server/auth";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";
import { api } from "@/utils/api";

import { AccountLayout } from "@/layouts/AccountLayout";

export default function AccountProfile() {
  const { data: user } = api.auth.getCurrentUser.useQuery();

  return (
    <AccountLayout
      title="User Billing"
      description={"Update your payment methods and manage your subscriptions."}
    >
      <div>Billing</div>
    </AccountLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession(context);
  if (!session) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  const helpers = genSSRHelpers(session);
  await helpers.auth.getCurrentUser.prefetch();

  return { props: { trpcState: helpers.dehydrate() } };
};
