import Nav from "@/components/nav/Nav";
import { Toaster } from "@/components/ui/toaster";
import Head from "next/head";

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
      <div
        className="font-sans flex min-h-screen flex-col items-center gap-4 bg-neutral-50 bg-gradient-to-t text-stone-900 dark:bg-stone-950  dark:text-white 
      "
      >
        <Nav />
        <main className="w-full max-w-screen-xl pt-14">
          <div className="px-24 py-6">{children}</div>
        </main>
        <Toaster />
      </div>
    </>
  );
}
