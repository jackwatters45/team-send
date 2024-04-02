import type { GetServerSideProps } from "next";

import { getServerAuthSession } from "@/server/auth";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";
import { api } from "@/utils/api";

import { AccountLayout } from "@/layouts/AccountLayout";
import ComingSoon from "@/components/ui/coming-soon";

export default function AccountBilling() {
  const { data: user } = api.auth.getCurrentUser.useQuery();

  if (!user) return <div>404</div>;

  return (
    <AccountLayout
      title="User Billing"
      description={"Update your payment methods and manage your subscriptions."}
    >
      <ComingSoon />
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
