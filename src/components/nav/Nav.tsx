import Image from "next/image";
import Link from "next/link";

import UserNav from "./UserNav";
import SearchButton from "./SearchButton";

export default function Nav() {
  return (
    <nav className="fixed flex h-14  w-full justify-center border-b px-8 dark:border-stone-500 dark:border-opacity-20">
      <div className="flex w-full max-w-screen-xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/favicon.ico" alt="Company Logo" width={20} height={20} />
          <span className="">Team Send</span>
        </Link>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/jackwatters45/team-send"
            className="text-sm text-stone-400 hover:text-stone-500 dark:text-stone-400 hover:dark:text-stone-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            Github
          </a>
          <Link
            className="text-sm text-stone-400 hover:text-stone-500 dark:text-stone-400 hover:dark:text-stone-300"
            href={"/docs"}
            type="button"
          >
            Docs
          </Link>
          <Link
            className="text-sm text-stone-400 hover:text-stone-500 dark:text-stone-400 hover:dark:text-stone-300"
            href={"/group/create"}
            type="button"
          >
            Create Group
          </Link>
          <SearchButton />
          <UserNav />
        </div>
      </div>
    </nav>
  );
}
