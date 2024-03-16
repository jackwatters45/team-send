import { MinusCircledIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import { type IUser } from "@/server/api/routers/auth";

interface AccountConnectionsProps {
  currentUser: IUser;
}

export default function AccountConnections({
  currentUser,
}: AccountConnectionsProps) {
  return (
    <section className="pt-12">
      <div className="flex flex-col pb-4 pt-3">
        <h2 className="text-xl font-semibold tracking-tight">Connections</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Manage your communication methods.
        </p>
      </div>
      <div className="flex flex-col gap-8 py-4 sm:gap-6">
        <div className="flex w-full items-center justify-between rounded-lg border p-4 dark:border-stone-800">
          <div className="space-y-0.5">
            <div className="text-base font-medium">Email</div>
            <div className="text-sm text-stone-500 dark:text-stone-400">
              {currentUser.nodeMailer
                ? `Connected to ${currentUser.nodeMailer} via Nodemailer.`
                : "Send emails via Nodemailer to members of this group."}
            </div>
          </div>
          {currentUser.nodeMailer ? (
            <Button
              type="button"
              variant="destructive"
              className="flex items-center gap-2"
            >
              <MinusCircledIcon className="h-4 w-4" />
              Disconnect
            </Button>
          ) : (
            <Button type="button">Connect</Button>
          )}
        </div>
        <div className="flex w-full items-center justify-between rounded-lg border p-4 dark:border-stone-800">
          <div className="space-y-0.5">
            <div className="text-base font-medium">Phone</div>
            <div className="text-sm text-stone-500 dark:text-stone-400">
              {currentUser.nodeMailer
                ? `Connected to ${currentUser.twilio} via Twilio.`
                : "Send texts via Twilio to members of this group."}
            </div>
          </div>
          {currentUser.twilio ? (
            <Button
              type="button"
              variant="destructive"
              className="flex items-center gap-2"
            >
              <MinusCircledIcon className="h-4 w-4" />
              Disconnect
            </Button>
          ) : (
            <Button type="button">Connect</Button>
          )}
        </div>
      </div>
    </section>
  );
}
