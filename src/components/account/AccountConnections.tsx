import { type User } from "@/server/api/routers/auth";
import { SettingActionItem } from "../ui/SettingActionItem";

interface AccountConnectionsProps {
  currentUser: User;
}

export default function AccountConnections({
  currentUser,
}: AccountConnectionsProps) {
  return (
    <section>
      <div className="flex flex-col pb-4 pt-3">
        <h2 className="text-lg font-semibold tracking-tight">Connections</h2>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Manage your communication methods.
        </p>
      </div>
      <div className="flex flex-col gap-8 py-4 sm:gap-6">
        <SettingActionItem
          title="Email"
          description={
            currentUser.nodeMailer
              ? `Connected via Nodemailer: ${currentUser.nodeMailer}.`
              : "Send emails via Nodemailer to members of this group."
          }
          actionButtonText={currentUser.nodeMailer ? "Disconnect" : "Connect"}
          buttonVariant={currentUser.nodeMailer ? "destructive" : "default"}
          onAction={() => {
            console.log("Connect email");
          }}
        />
        <SettingActionItem
          title="Phone"
          description={
            currentUser.twilio
              ? `Connected via Twilio: ${currentUser.twilio}.`
              : "Send texts via Twilio to members of this group."
          }
          actionButtonText={currentUser.twilio ? "Disconnect" : "Connect"}
          buttonVariant={currentUser.twilio ? "destructive" : "default"}
          onAction={() => {
            console.log("Connect phone");
          }}
        />
      </div>
    </section>
  );
}
