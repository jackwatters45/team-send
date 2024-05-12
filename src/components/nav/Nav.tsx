import Image from "next/image";

import UserNav from "./UserNav";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
} from "../ui/navigation-menu";
import { useSession } from "next-auth/react";
import { ButtonLink } from "../ui/button";
import HamburgerMenu from "./HamburgerMenu";

export default function Nav() {
	const session = useSession();

	return (
		<NavigationMenu className="max-w-screen fixed z-50 flex  h-14 w-screen justify-center border-b bg-stone-50 bg-opacity-90 px-8 dark:border-stone-500 dark:border-opacity-20 dark:bg-stone-950 dark:bg-opacity-80">
			<div className="flex w-full max-w-screen-xl items-center justify-between">
				<NavigationMenuItem>
					<NavigationMenuLink href="/" className="flex items-center gap-3">
						<Image src="/favicon.ico" alt="Company Logo" width={20} height={20} />
						<span>Team Send</span>
					</NavigationMenuLink>
				</NavigationMenuItem>
				<div className="hidden items-center gap-4 md:flex">
					<NavigationMenuItem className="pr-2">
						<NavigationMenuLink
							className="text-sm text-stone-400 hover:text-stone-500 dark:text-stone-400 hover:dark:text-stone-300"
							href={"/dashboard"}
							type="button"
						>
							Dashboard
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem className="pr-2">
						<NavigationMenuLink
							className="text-sm text-stone-400 hover:text-stone-500 dark:text-stone-400 hover:dark:text-stone-300"
							href="https://github.com/jackwatters45/team-send"
							target="_blank"
							rel="noopener noreferrer"
						>
							Github
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem className="pr-2">
						<NavigationMenuLink
							className="text-sm text-stone-400 hover:text-stone-500 dark:text-stone-400 hover:dark:text-stone-300"
							href={"/docs"}
							type="button"
						>
							Docs
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem className="pr-2">
						<NavigationMenuLink
							className="text-sm text-stone-400 hover:text-stone-500 dark:text-stone-400 hover:dark:text-stone-300"
							href={"/group/create"}
							type="button"
						>
							Create Group
						</NavigationMenuLink>
					</NavigationMenuItem>
					{/* <NavigationMenuItem>
						<SearchButton />
					</NavigationMenuItem> */}
					{session.status !== "unauthenticated" ? (
						<NavigationMenuItem style={{ lineHeight: "0" }}>
							<UserNav />
						</NavigationMenuItem>
					) : (
						<ButtonLink href="/login" className="h-8 px-3 py-0">
							Login
						</ButtonLink>
					)}
				</div>
				<div className="block md:hidden">
					<HamburgerMenu />
				</div>
			</div>
		</NavigationMenu>
	);
}
