import useProtectedPage from "@/hooks/useProtectedRoute";

import { AccountLayout } from "@/layouts/AccountLayout";

export default function AccountProfile() {
  useProtectedPage();

  return (
    <AccountLayout
      title="User Billing"
      description={"Update your payment methods and manage your subscriptions."}
    >
      <div>Billing</div>
    </AccountLayout>
  );
}
