import Groups from "@/components/group/Groups";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { LoadingPage } from "@/components/ui/loading";

import Image from "next/image";
import { useState, useEffect } from "react";
import { ButtonLink } from "@/components/ui/button";
import Layout from "@/layouts/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import MailingForm from "@/components/forms/MailingForm";

export default function Home() {
	const session = useSession();

	const { isLoading } = api.group.getAll.useQuery();

	if (session.status === "unauthenticated") return <HomeLoggedOut />;

	if (isLoading) return <LoadingPage />;

	return <Groups />;
}

function HomeLoggedOut() {
	// TODO - when add dark mode  toggle, use that instead of this
	const [prefersDarkMode, setPrefersDarkMode] = useState<boolean | undefined>(
		undefined,
	);

	useEffect(() => {
		const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
		setPrefersDarkMode(darkModeQuery.matches);

		const updatePrefersDarkMode = (e: MediaQueryListEvent | MediaQueryList) => {
			setPrefersDarkMode(e.matches);
		};

		updatePrefersDarkMode(darkModeQuery);

		darkModeQuery.addEventListener("change", updatePrefersDarkMode);

		return () => {
			darkModeQuery.removeEventListener("change", updatePrefersDarkMode);
		};
	}, []);

	return (
		<Layout>
			<section className="mx-auto w-full max-w-screen-lg  border-b py-16 xs:px-4 sm:px-0 md:pt-24 lg:py-32 dark:border-stone-500/20">
				<div className="space-y-12 md:px-6 xl:space-y-20">
					<div className="mx-auto grid max-w-[1300px] gap-6 sm:px-6 xl:px-10">
						<h1 className="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-[3.4rem] 2xl:text-[3.75rem]">
							All your informal communication in one place.
						</h1>
						<div className="flex flex-col items-start space-y-6">
							<p className="mx-auto text-stone-500 md:text-xl dark:text-stone-400">
								Coordinate emails, SMS, and GroupMe messages effortlessly from a single
								interface. Stay connected across all platforms with Team Send.
								Effortless coordination, seamless connection with all your informal
								teams
							</p>
							<div className="flex w-full justify-end xs:w-fit xs:pr-4">
								<ButtonLink href="/login" className="w-full px-8 xs:w-fit">
									Get Started
								</ButtonLink>
							</div>
						</div>
					</div>
					{prefersDarkMode === undefined ? (
						<Skeleton className="hidden aspect-[3/2] w-full rounded-xl bg-white shadow-2xl sm:block sm:shadow-2xl dark:bg-stone-950" />
					) : (
						<Image
							alt="Hero"
							className="mx-auto hidden aspect-[3/2] overflow-hidden rounded-xl object-cover sm:block sm:shadow-2xl"
							height="400"
							src={
								prefersDarkMode
									? "https://res.cloudinary.com/drheg5d7j/image/upload/v1714271048/ts-groups-dark_wn3y0b.webp"
									: "https://res.cloudinary.com/drheg5d7j/image/upload/v1714271048/ts-groups-light_dtmve3.webp"
							}
							width="1270"
						/>
					)}
				</div>
			</section>
			<section className="mx-auto w-full max-w-screen-lg space-y-12 border-b py-16 xs:px-4 md:py-24 lg:py-32 xl:space-y-20 dark:border-stone-500/20">
				<div className="space-y-12 md:space-y-16 md:px-6">
					<div className="flex flex-col items-center justify-center space-y-4 text-center">
						<div className="space-y-2">
							<div className="inline-block rounded-lg bg-stone-100 px-3 py-1 text-sm dark:bg-stone-800">
								Features
							</div>
							<h2 className="text-left text-3xl font-bold tracking-tighter xs:text-center sm:text-5xl">
								Connect your communication channels.
							</h2>
							<p className="text-left text-stone-500 xs:text-center md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-stone-400">
								Team Send is the only platform that allows you to connect all your
								informal communication channels in one place. Coordinate with your team
								across all platforms.
							</p>
						</div>
					</div>
					<div className="mx-auto grid items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3">
						<div className="grid gap-1">
							<h3 className="text-lg font-bold">SMS</h3>
							<p className="text-sm text-stone-500 dark:text-stone-400">
								Leverage your existing Twilio account or our built-in SMS
								(pay-as-you-go) to send text messages to your team.
							</p>
						</div>
						<div className="grid gap-1">
							<h3 className="text-lg font-bold">Emails</h3>
							<p className="text-sm text-stone-500 dark:text-stone-400">
								{
									"Send emails to your team members. Just connect your gmail account and you're good to go."
								}
							</p>
						</div>
						<div className="grid gap-1">
							<h3 className="text-lg font-bold">GroupMe</h3>
							<p className="text-sm text-stone-500 dark:text-stone-400">
								Connect to your GroupMe groups and add bots that can send and listen to
								messages.
							</p>
						</div>
						<div className="grid gap-1">
							<h3 className="text-lg font-bold">Whatsapp</h3>
							<p className="text-sm text-stone-500 dark:text-stone-400">
								Coming soon...
							</p>
						</div>
						<div className="grid gap-1">
							<h3 className="text-lg font-bold">Calendar Integrations</h3>
							<p className="text-sm text-stone-500 dark:text-stone-400">Up next...</p>
						</div>
					</div>
				</div>
				{prefersDarkMode === undefined ? (
					<Skeleton className="hidden aspect-[10/7] w-full rounded-xl bg-white shadow-2xl sm:block sm:shadow-2xl dark:bg-stone-950" />
				) : (
					<Image
						alt="Hero"
						className="mx-auto hidden aspect-[10/7] overflow-hidden rounded-xl object-cover sm:block sm:shadow-2xl"
						height="400"
						src={
							prefersDarkMode
								? "https://res.cloudinary.com/drheg5d7j/image/upload/v1714271048/ts-group-send-dark_loyysm.webp"
								: "https://res.cloudinary.com/drheg5d7j/image/upload/v1714271048/ts-group-send-light_zxtoqq.webp"
						}
						width="1270"
					/>
				)}
			</section>
			<section>
				<MailingForm />
			</section>
		</Layout>
	);
}
