import { SessionProvider, useSession } from "next-auth/react";
import { Inter } from "next/font/google";

import type { Session } from "next-auth";
import type { AppType } from "next/app";
import { useEffect } from "react";
import Pusher from "pusher-js";

import { env } from "@/env";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { api } from "@/utils/api";
import "@/styles/globals.css";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

const inter = Inter({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-sans",
});

export interface MessageStatusPush {
	status: "sent" | "failed";
	messageId: string;
	groupName: string;
}

if (typeof window !== "undefined") {
	// checks that we are client-side
	posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
		api_host: env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
		loaded: (posthog) => {
			if (env.NODE_ENV === "development") posthog.debug(); // debug mode in development
		},
	});
}

const MyApp: AppType<{ session: Session | null }> = ({
	Component,
	pageProps: { session, ...pageProps },
}) => {
	return (
		<SessionProvider session={session}>
			<PostHogProvider client={posthog}>
				<PusherProvider>
					<div className={`font-sans ${inter.variable}`}>
						<Component {...pageProps} />
						<Toaster />
					</div>
				</PusherProvider>
			</PostHogProvider>
		</SessionProvider>
	);
};

export default api.withTRPC(MyApp);

export function PusherProvider({ children }: { children: React.ReactNode }) {
	const { data: session } = useSession();

	const ctx = api.useUtils();

	const userId = session?.user?.id;
	useEffect(() => {
		if (!userId) return;
		const pusher = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
			cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
		});
		const channel = pusher.subscribe(`user-${userId}`);
		channel.bind(
			"message-status",
			({ status, messageId, groupName }: MessageStatusPush) => {
				if (status === "sent") {
					toast({
						title: `Message ${messageId} sent`,
						description: `Message to group ${groupName} has been sent successfully`,
					});
					void ctx.group.getGroupHistoryById.invalidate();
					void ctx.message.getMessageById.invalidate();
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
			if (pusher) {
				pusher.disconnect();
			}
			if (channel) {
				channel.unbind_all();
				channel.unsubscribe();
			}
		};
	}, [userId, ctx]);

	return <>{children}</>;
}
