import { Button } from "./button";
import {
  AlertDialogCancel,
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";

interface DangerZoneCardProps {
  title: string;
  description: string;
  buttonTitle: string;
  dialog: {
    title?: string;
    description: string | null;
    confirmText?: string;
    onConfirm: () => void;
  };
}

export default function DangerZoneCard({
  title,
  description,
  buttonTitle,
  dialog,
}: DangerZoneCardProps) {
  return (
    <div className="flex flex-row items-center justify-between gap-2  rounded-lg border border-red-300/80 p-4 dark:border-stone-800 dark:bg-stone-950">
      <div className="space-y-0.5">
        <div className="text-base font-medium">{title}</div>
        <div className="text-sm text-stone-500 dark:text-stone-400">
          {description}
        </div>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="destructive">
            {buttonTitle}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialog.title ?? "Are you absolutely sure?"}
            </AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={dialog.onConfirm}>
              {dialog.confirmText ?? "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
