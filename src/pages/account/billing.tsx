import type { GetServerSideProps } from "next";

import { getServerAuthSession } from "@/server/auth";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";
import { api } from "@/utils/api";

import { AccountLayout } from "@/layouts/AccountLayout";
import ComingSoon from "@/components/error/ComingSoon";
import { renderErrorComponent } from "@/components/error/renderErrorComponent";

export default function AccountBilling() {
  const { data: user, error } = api.user.getCurrentUser.useQuery();

  if (!user) return renderErrorComponent(error);

  return <ComingSoon />;

  return (
    <AccountLayout
      title="User Billing"
      description={"Update your payment methods and manage your subscriptions."}
    >
      Billing...
    </AccountLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession(context);
  if (!session) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  const helpers = genSSRHelpers(session);
  await helpers.user.getCurrentUser.prefetch();

  return { props: { trpcState: helpers.dehydrate() } };
};
