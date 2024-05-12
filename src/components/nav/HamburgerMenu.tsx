import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { signOut, useSession } from "next-auth/react";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";

export default function HamburgerMenu() {
	const userId = useSession().data?.user?.id;

	const handleLogout = async () => await signOut();

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="ghost" className="h-fit p-2">
					<HamburgerMenuIcon className="h-5 w-5" />
				</Button>
			</SheetTrigger>
			<SheetContent>
				<div className="grid h-full py-4">
					<Accordion type="multiple">
						<Link
							href="/"
							className="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline"
						>
							Home
						</Link>
						<Separator className="dark:bg-stone-500/20" />
						<Link
							href={"/dashboard"}
							className="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline"
						>
							Dashboard
						</Link>
						<Separator className="dark:bg-stone-500/20" />
						<Link
							className="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline"
							href="https://github.com/jackwatters45/team-send"
							target="_blank"
							rel="noopener noreferrer"
						>
							Github
						</Link>
						<Separator className="dark:bg-stone-500/20" />
						{/* <Link
              href={"/docs"}
              className="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline"
            >
              Docs
            </Link> */}
						{/* <Separator className="dark:bg-stone-500/20" /> */}
						<Link
							href={"/group/create"}
							className="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline"
						>
							Create Group
						</Link>
						<Separator className="dark:bg-stone-500/20" />
						{userId ? (
							<AccordionItem value="item-1">
								<AccordionTrigger>Account</AccordionTrigger>
								<AccordionContent className="space-y-3 px-4">
									<Link
										href="/account/profile"
										className="flex h-10 items-center rounded-md px-2 font-medium hover:bg-stone-100 dark:hover:bg-stone-800"
									>
										Profile
									</Link>
									<Separator className="dark:bg-stone-500/20" />
									<Link
										href="/account/settings"
										className="flex h-10 items-center rounded-md px-2 font-medium hover:bg-stone-100 dark:hover:bg-stone-800"
									>
										Settings
									</Link>
									<Separator className="dark:bg-stone-500/20" />
									<Button
										onClick={handleLogout}
										variant={"ghost"}
										className="w-full justify-start px-2 py-0"
									>
										Log out
									</Button>
								</AccordionContent>
							</AccordionItem>
						) : (
							<Link
								href="/login"
								className="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline"
							>
								Login
							</Link>
						)}
					</Accordion>
					{/* <div className="self-end">
						<SearchButton className="w-full" />
					</div> */}
				</div>
			</SheetContent>
		</Sheet>
	);
}
