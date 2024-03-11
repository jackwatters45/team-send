"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface GroupSidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
  }[];
}

export function GroupSidebarNav({
  className,
  items,
  ...props
}: GroupSidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className,
      )}
      {...props}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href
              ? "bg-stone-200 bg-opacity-50 hover:bg-stone-200 hover:bg-opacity-50 dark:bg-stone-800 dark:bg-opacity-50 dark:hover:bg-stone-800 dark:hover:bg-opacity-50"
              : "hover:bg-transparent hover:underline dark:hover:bg-transparent",
            "justify-start",
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
