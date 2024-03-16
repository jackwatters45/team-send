import { Button } from "../ui/button";

export default function AccountDangerZone() {
  return (
    <section className="pt-12">
      <div className="flex flex-col pb-4 pt-3">
        <h2 className="text-xl font-semibold tracking-tight">Danger Zone</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Delete your account and data.
        </p>
      </div>
      <div className="flex flex-col gap-8 py-4 sm:gap-6">
        <div className="flex w-full items-center justify-between rounded-lg border p-4 dark:border-stone-800">
          <div className="space-y-0.5">
            <div className="text-base font-medium">Reset Password</div>
            <div className="text-sm text-stone-500 dark:text-stone-400">
              Send emails via Nodemailer to members of this group.
            </div>
          </div>
          <Button type="button">Reset Password</Button>
        </div>
        <div className="flex items-center justify-between gap-2 rounded-lg  border border-red-300/80 p-4 dark:border-red-900/60">
          <div className="space-y-0.5">
            <div className="text-base font-medium">Archive this group</div>
            <div className="text-sm text-stone-500 dark:text-stone-400">
              Archive this group and make read-only.
            </div>
          </div>
          <Button type="button" variant="destructive" onClick={() => {}}>
            Archive group
          </Button>
        </div>
      </div>
    </section>
  );
}
