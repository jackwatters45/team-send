import Image from "next/image";
import Link from "next/link";

import UserNav from "./UserNav";
import SearchButton from "./SearchButton";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
} from "../ui/navigation-menu";

export default function Nav() {
  return (
    <NavigationMenu className="max-w-screen fixed z-50 flex  h-14 w-screen justify-center border-b bg-stone-50 bg-opacity-90 px-8 dark:border-stone-500 dark:border-opacity-20 dark:bg-stone-950 dark:bg-opacity-80">
      <div className="flex w-full max-w-screen-xl items-center justify-between">
        <NavigationMenuItem>
          <NavigationMenuLink href="/" className="flex items-center gap-3">
            <Image
              src="/favicon.ico"
              alt="Company Logo"
              width={20}
              height={20}
            />
            <span className="">Team Send</span>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <div className="flex items-center gap-6">
          <NavigationMenuItem>
            <a
              href="https://github.com/jackwatters45/team-send"
              className="text-sm text-stone-400 hover:text-stone-500 dark:text-stone-400 hover:dark:text-stone-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              Github
            </a>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              className="text-sm text-stone-400 hover:text-stone-500 dark:text-stone-400 hover:dark:text-stone-300"
              href={"/docs"}
              type="button"
            >
              Docs
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              className="text-sm text-stone-400 hover:text-stone-500 dark:text-stone-400 hover:dark:text-stone-300"
              href={"/group/create"}
              type="button"
            >
              Create Group
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <SearchButton />
          </NavigationMenuItem>
          <NavigationMenuItem>
            <UserNav />
          </NavigationMenuItem>
        </div>
      </div>
    </NavigationMenu>
  );
}
