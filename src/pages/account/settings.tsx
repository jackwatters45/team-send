import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";

import { api } from "@/utils/api";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";
import { getServerAuthSession } from "@/server/auth";

import { SettingActionItem } from "@/components/ui/setting-action-item";
import { AccountLayout } from "@/layouts/AccountLayout";
import { renderErrorComponent } from "@/components/error/renderErrorComponent";
import { toast } from "@/components/ui/use-toast";

// TODO archive logic + do i even want to do?
// TODO connections
export default function AccountSettings() {
  const { data: user, error } = api.auth.getCurrentUser.useQuery();

  const { refetch } = api.auth.getExportData.useQuery(undefined, {
    enabled: false,
  });

  const handleExport = async () => {
    const res = await refetch();

    if (!res.data) {
      toast({
        title: "Error exporting data",
        description:
          "There was an error exporting your data. Please try again.",
      });
      return;
    }

    const exportData = res.data;

    const blob = new Blob([exportData], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${user?.id}-data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Data exported",
      description: "Your data has been successfully exported.",
    });
  };

  const router = useRouter();
  const { mutate: archiveAccount } = api.auth.archiveAccount.useMutation({
    onSuccess: async () => {
      await router.push("/login");
      toast({
        title: "Account archived",
        description: "Your account has been successfully archived.",
      });
    },
    onError: () => {
      toast({
        title: "Error archiving account",
        description:
          "There was an error archiving your account. Please try again.",
      });
    },
  });
  const handleArchiveAccount = () => archiveAccount();

  const { mutate: deleteAccount } = api.auth.deleteAccount.useMutation({
    onSuccess: async () => {
      await router.push("/login");
      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error deleting account",
        description:
          "There was an error deleting your account. Please try again.",
      });
    },
  });
  const handleDeleteAccount = () => deleteAccount();

  if (!user) return renderErrorComponent(error);

  return (
    <AccountLayout
      title="User Settings"
      description={"View and edit your settings."}
    >
      <div
        className=" flex flex-col pt-3
        dark:border-stone-500 dark:border-opacity-20"
      >
        <h2 className="text-xl font-semibold tracking-tight">
          Edit Account Settings
        </h2>
        <div className="text-sm text-stone-500 dark:text-stone-400">
          Make changes to account settings here.
        </div>
      </div>
      <section className="pt-6">
        <div className="rounded-md bg-stone-100 px-6 py-2 shadow drop-shadow dark:bg-stone-900/50">
          <div className="flex flex-col pb-4 pt-4">
            <h2 className="text-lg font-semibold tracking-tight">
              Connections
            </h2>
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
        </div>
      </section>
      <section className="pt-6">
        <div className="rounded-md bg-stone-100 px-6 py-2 shadow drop-shadow dark:bg-stone-900/50">
          <div className="flex flex-col pb-4 pt-4">
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
              title="Archive your account"
              description="Your account can be restored at any time after it's been archived."
              actionButtonText="Archive Account"
              buttonVariant="destructive"
              onAction={handleArchiveAccount}
            />
            <SettingActionItem
              title="Delete your account"
              description="Once you delete your account, there is no going back. Please be certain."
              actionButtonText="Delete Account"
              buttonVariant="destructive"
              onAction={handleDeleteAccount}
            />
          </div>
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
