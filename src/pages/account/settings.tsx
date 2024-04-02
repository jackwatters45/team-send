import type { GetServerSideProps } from "next";

import { api } from "@/utils/api";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";
import { getServerAuthSession } from "@/server/auth";

import { SettingActionItem } from "@/components/ui/setting-action-item";
import { AccountLayout } from "@/layouts/AccountLayout";
import { renderErrorComponent } from "@/components/error/renderErrorComponent";

export default function AccountSettings() {
  const { data: user, error } = api.auth.getCurrentUser.useQuery();

  const handleExport = () => {
    console.log("Export data");
  };

  if (!user) return renderErrorComponent(error);

  return (
    <AccountLayout
      title="User Settings"
      description={"View and edit your settings."}
    >
      <div
        className="mb-2 flex flex-col border-b pb-2 pt-3
        dark:border-stone-500 dark:border-opacity-20"
      >
        <h2 className="text-xl font-semibold tracking-tight">
          Edit Account Settings
        </h2>
        <div className="text-sm text-stone-500 dark:text-stone-400">
          Make changes to account settings here.
        </div>
      </div>
      <section>
        <div className="flex flex-col pb-4 pt-7">
          <h2 className="text-lg font-semibold tracking-tight">Connections</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Manage your communication methods.
          </p>
        </div>
        <div className="flex flex-col gap-8 py-4 sm:gap-6">
          <SettingActionItem
            title="Email"
            description={
              user.nodeMailer
                ? `Connected via Nodemailer: ${user.nodeMailer}.`
                : "Send emails via Nodemailer to members of this group."
            }
            actionButtonText={user.nodeMailer ? "Disconnect" : "Connect"}
            buttonVariant={user.nodeMailer ? "destructive" : "default"}
            onAction={() => {
              console.log("Connect email");
            }}
          />
          <SettingActionItem
            title="Phone"
            description={
              user.twilio
                ? `Connected via Twilio: ${user.twilio}.`
                : "Send texts via Twilio to members of this group."
            }
            actionButtonText={user.twilio ? "Disconnect" : "Connect"}
            buttonVariant={user.twilio ? "destructive" : "default"}
            onAction={() => {
              console.log("Connect phone");
            }}
          />
        </div>
      </section>
      <section>
        <div className="flex flex-col pb-4 pt-7">
          <h2 className="text-lg font-semibold tracking-tight">
            Account Actions
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Manage your account settings.
          </p>
        </div>
        <div className="flex flex-col gap-8 py-4 sm:gap-6">
          <SettingActionItem
            title="Export Your Data"
            description="Download a file containing your account information for safekeeping."
            actionButtonText="Export Data"
            onAction={handleExport}
          />
          <SettingActionItem
            title="Reset Password"
            description="Send a password reset link to your email address."
            actionButtonText="Reset Password"
            onAction={() => {
              console.log("Reset password");
            }}
          />
          <SettingActionItem
            title="Archive your account"
            description="Once you archive your account, you can restore it later."
            actionButtonText="Archive Account"
            buttonVariant="destructive"
            onAction={() => {
              console.log("Archive group");
            }}
          />
          <SettingActionItem
            title="Delete your account"
            description="Once you delete your account, there is no going back. Please be certain."
            actionButtonText="Delete Account"
            buttonVariant="destructive"
            onAction={() => {
              console.log("Archive group");
            }}
          />
        </div>
      </section>
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
