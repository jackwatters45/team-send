"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export interface SidebarNavItem {
  href: string;
  title: string;
}

export type SidebarNavItems = Array<SidebarNavItem>;

export interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: SidebarNavItems;
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
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
