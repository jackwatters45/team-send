import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export default function SearchButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      type="button"
      aria-label="Search"
      variant={"secondary"}
      className={cn(
        "flex h-auto items-center gap-3 px-3 py-[6px] hover:bg-stone-200/50",
        className,
      )}
      {...props}
    >
      <span className="flex items-center gap-3">
        <MagnifyingGlassIcon className="h-5 w-5" />
        <span className="font-normal text-stone-400 dark:text-stone-400">
          Search
        </span>
      </span>
      <span className="flex items-center gap-1 rounded-sm border border-stone-600 px-1 text-stone-400 dark:text-stone-400">
        <kbd className="">⌘</kbd>
        <kbd className="text-xs ">K</kbd>
      </span>
    </Button>
  );
}
