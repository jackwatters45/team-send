import Image from "next/image";
import Link from "next/link";
import UserNav from "./UserNav";

export default function Nav() {
  return (
    <nav className="fixed flex h-14  w-full justify-center border-b border-stone-400 border-opacity-10 px-8">
      <div className="flex w-full max-w-screen-xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/favicon.ico" alt="Company Logo" width={20} height={20} />
          <span className="">Team Send</span>
        </Link>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/jackwatters45/team-send"
            className="text-sm text-stone-800 dark:text-stone-100  opacity-60 hover:opacity-75"
            target="_blank" 
            rel="noopener noreferrer" 
          >
            Github
          </a>
          <Link
            className="text-sm text-stone-800 dark:text-stone-100  opacity-60 hover:opacity-75"
            href={"/create-group"}
            type="button"
          >
            Create Group
          </Link>
          <UserNav />
        </div>
      </div>
    </nav>
  );
}
