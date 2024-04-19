import Nav from "@/components/nav/Nav";
import { Toaster } from "@/components/ui/toaster";
import Head from "next/head";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import Pusher from "pusher-js";

import { env } from "@/env";
import { toast } from "@/components/ui/use-toast";

export interface MessageSendData {
  status: "sent" | "failed";
  messageId: string;
  groupName: string;
}

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
  const session = useSession();

  const userId = session?.data?.user?.id;
  useEffect(() => {
    const pusher = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe(`user-${userId}`);
    channel.bind(
      "message-status",
      ({ status, messageId, groupName }: MessageSendData) => {
        if (status === "sent") {
          toast({
            title: `Message ${messageId} sent`,
            description: `Message to group ${groupName} has been sent successfully`,
          });
        } else {
          toast({
            title: `Message ${messageId} failed to send`,
            description: `Message to group ${groupName} failed to send`,
            variant: "destructive",
          });
        }
      },
    );

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [userId]);

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
      <Toaster />
    </>
  );
}
