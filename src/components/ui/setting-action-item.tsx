import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { useAutoAnimate } from "@formkit/auto-animate/react";

interface ISettingActionItemProps {
  title: string;
  description: string | React.ReactNode;
  actionButtonText: string | React.ReactNode;
  buttonVariant?: "default" | "destructive";
  onAction: () => void;
  hideButton?: boolean;
  children?: ReactNode;
}

export const SettingActionItem = ({
  title,
  description,
  actionButtonText,
  buttonVariant = "default",
  onAction,
  hideButton,
  children,
}: ISettingActionItemProps) => {
  const [parent] = useAutoAnimate();

  return (
    <div
      className={cn(
        "rounded-lg border p-4 shadow-sm",
        buttonVariant === "destructive"
          ? "border-red-300/75 dark:border-red-900/60"
          : "border-stone-300 dark:border-stone-800",
      )}
      ref={parent}
    >
      <div className="flex items-center justify-between gap-2 ">
        <div className="space-y-0.5">
          <div className="text-base font-medium">{title}</div>
          <div className="text-sm text-stone-500 dark:text-stone-400">
            {description}
          </div>
        </div>
        {!hideButton && (
          <Button type="button" variant={buttonVariant} onClick={onAction}>
            {actionButtonText}
          </Button>
        )}
      </div>
      {children}
    </div>
  );
};
