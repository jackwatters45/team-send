import { api } from "@/utils/api";

import { AccountLayout } from "@/layouts/AccountLayout";
import AccountProfileForm from "@/components/account/AccountProfileForm";
import AccountConnections from "@/components/account/AccountConnections";
import AccountDangerZone from "@/components/account/AccountDangerZone";

export default function AccountProfile() {
  const { data: currentUser } = api.auth.getCurrentUser.useQuery();

  return currentUser ? (
    <AccountLayout
      title="User Profile"
      description={"Manage your account information"}
    >
      <AccountProfileForm currentUser={currentUser} />
      <AccountConnections currentUser={currentUser} />
      <AccountDangerZone />
    </AccountLayout>
  ) : null;
}
