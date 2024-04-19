import Nav from "@/components/nav/Nav";
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
      <div className="font-sans flex min-h-screen flex-col items-center gap-4">
        <Nav />
        <main className="w-full max-w-screen-xl flex-1 pt-14 2xl:max-w-screen-2xl">
          <div className="xs:px-12 px-6 py-6 sm:px-24">{children}</div>
        </main>
      </div>
    </>
  );
}
