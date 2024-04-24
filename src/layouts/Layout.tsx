import Nav from "@/components/nav/Nav";
import Head from "next/head";
import Link from "next/link";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function Layout({
  children,
  title = "Team Send",
  description = "Easily send targeted bulk SMS to groups",
}: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="font-sans flex min-h-screen flex-col items-center gap-4">
        <Nav />
        <main className="w-full max-w-screen-xl flex-1 pt-14 2xl:max-w-screen-2xl">
          <div className="xs:px-12 px-6 py-6 sm:px-24">{children}</div>
        </main>
        <Footer />
      </div>
    </>
  );
}

function Footer() {
  return (
    <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 text-xs text-gray-500 sm:flex-row md:px-6 dark:border-stone-500/20 dark:text-gray-400">
      <p className=" ">
        © {new Date().getFullYear()} Yats Co. All rights reserved.
      </p>
      <nav className="flex gap-4 sm:ml-auto sm:gap-6">
        <Link className=" underline-offset-4 hover:underline" href="/terms">
          Terms of Service
        </Link>
        <Link className=" underline-offset-4 hover:underline" href="/privacy">
          Privacy
        </Link>
      </nav>
    </footer>
  );
}
