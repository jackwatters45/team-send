import Layout from "@/layouts/Layout";
import { Button } from "../ui/button";
import Link from "next/link";
import { useRouter } from "next/router";

export default function ComingSoon() {
  const router = useRouter();
  const handleGoBack = () => router.back();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center space-y-4 py-16 text-center md:py-28 lg:py-36">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Coming Soon
          </h1>
          <p className="max-w-[600px] text-stone-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-stone-400">
            This page is currently under construction. We&apos;re adding the
            finishing touches to bring you something special. Coming very soon!
          </p>
        </div>
        <div className="space-x-4 ">
          <Button variant="outline">
            <Link href="/">Go home</Link>
          </Button>
          <Button variant="outline" onClick={handleGoBack}>
            Go back
          </Button>
        </div>
      </div>
    </Layout>
  );
}
