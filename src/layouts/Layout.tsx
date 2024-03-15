import Footer from "@/components/footer/Footer";
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
        className="font-sans flex min-h-screen flex-col items-center gap-4 bg-stone-50 text-stone-900 dark:bg-stone-950  dark:text-white 
      "
      >
        <Nav />
        <main className="w-full max-w-screen-2xl flex-1 pt-14">
          <div className="xs:px-12 px-6 py-6 sm:px-24">{children}</div>
        </main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
}
