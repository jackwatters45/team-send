import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { extractInitials } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function UserNav() {
  const user = useSession()?.data?.user;

  const handleLogout = async () => {
    await signOut();
  };

  if (!user) {
    return (
      <Avatar className="h-8 w-8">
        <AvatarFallback />
      </Avatar>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={"icon"} className="relative rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image ?? undefined} alt={user.name!} />
            <AvatarFallback>{extractInitials(user.name!)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            {user.username && (
              <p className="text-xs leading-none text-stone-400 dark:text-stone-400">
                @{user.username}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/account/profile">
            <DropdownMenuItem>
              Profile
              {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
            </DropdownMenuItem>
          </Link>
          {/* <Link href="/account/billing">
            <DropdownMenuItem>
              Billing
              <DropdownMenuShortcut>⇧⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link> */}
          <Link href="/account/settings">
            <DropdownMenuItem>
              Settings
              {/* <DropdownMenuShortcut>⇧⌘S</DropdownMenuShortcut> */}
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Log out
          {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
