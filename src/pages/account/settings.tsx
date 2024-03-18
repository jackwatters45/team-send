import { AccountLayout } from "@/layouts/AccountLayout";
import AccountConnections from "@/components/account/AccountConnections";
import AccountDangerZone from "@/components/account/AccountDangerActions";
import { api } from "@/utils/api";

export default function AccountSettings() {
  const { data: currentUser } = api.auth.getCurrentUser.useQuery();

  return currentUser ? (
    <AccountLayout
      title="User Settings"
      description={"View and edit your settings."}
    >
      <div
        className="mb-2 flex flex-col border-b pb-2 pt-3
        dark:border-stone-500 dark:border-opacity-20
      "
      >
        <h2 className="text-xl font-semibold tracking-tight">
          Edit Account Settings
        </h2>
        <div className="text-sm text-stone-500 dark:text-stone-400">
          Make changes to account settings here.
        </div>
      </div>
      <div className="pt-4">
        <AccountConnections currentUser={currentUser} />
      </div>
      <div className="pt-4">
        <AccountDangerZone />
      </div>
    </AccountLayout>
  ) : null;
}
