import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ISettingActionItemProps {
  title: string;
  description: string;
  actionButtonText: string | React.ReactNode;
  buttonVariant?: "default" | "destructive";
  onAction: () => void;
}

export const SettingActionItem = ({
  title,
  description,
  actionButtonText,
  buttonVariant = "default",
  onAction,
}: ISettingActionItemProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-lg border p-4 shadow-sm",
        buttonVariant === "destructive"
          ? "border-red-300/75 dark:border-red-900/60"
          : "border-stone-300 dark:border-stone-800",
      )}
    >
      <div className="space-y-0.5">
        <div className="text-base font-medium">{title}</div>
        <div className="text-sm text-stone-500 dark:text-stone-400">
          {description}
        </div>
      </div>
      <Button type="button" variant={buttonVariant} onClick={onAction}>
        {actionButtonText}
      </Button>
    </div>
  );
};
