import { cn } from "@/lib/utils";
import { Button } from "./button";

interface DangerZoneCardProps {
  title: string;
  description: string;
  buttonTitle: string;
  onClick: () => void;
  isLast?: boolean;
}

export default function DangerZoneCard({
  title,
  description,
  buttonTitle,
  onClick,
  isLast,
}: DangerZoneCardProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 space-y-2  border-red-300/80 p-4 dark:border-red-900/60",
        isLast ? "" : "border-b",
      )}
    >
      <div className="space-y-0.5">
        <div className="text-base font-medium">{title}</div>
        <div className="text-sm text-stone-500 dark:text-stone-400">
          {description}
        </div>
      </div>
      <div>
        <Button type="button" variant="destructive" onClick={onClick}>
          {buttonTitle}
        </Button>
      </div>
    </div>
  );
}
