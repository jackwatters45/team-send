import { SettingActionItem } from "../ui/SettingActionItem";

export default function AccountActions() {
  const handleExport = () => {
    console.log("Export data");
  };

  return (
    <section>
      <div className="flex flex-col pb-4 pt-3">
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
  );
}
