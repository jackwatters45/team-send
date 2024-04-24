import Image from "next/image";

import { ButtonLink } from "@/components/ui/button";
import Layout from "@/layouts/Layout";

export default function HomeLoggedOut() {
  return (
    <Layout>
      <section className="w-full border-b py-12 md:pt-24 lg:py-32 dark:border-stone-500 dark:border-opacity-20">
        <div className="space-y-12 px-4 md:px-6 xl:space-y-20">
          <div className="mx-auto grid max-w-[1300px] gap-4 px-4 sm:px-6 md:grid-cols-2 md:gap-16 md:px-10">
            <div>
              <h1 className="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]">
                All your informal communication in one place.
              </h1>
            </div>
            <div className="flex flex-col items-start space-y-4">
              <p className="mx-auto max-w-[700px] text-stone-500 md:text-xl dark:text-stone-400">
                Coordinate emails, SMS, and GroupMe messages effortlessly from a
                single interface. Stay connected across all platforms with Team
                Send. Effortless coordination, seamless connection with all your
                informal teams
              </p>
              <div className="flex w-full justify-end pr-4">
                <ButtonLink href="/login">Get Started</ButtonLink>
              </div>
            </div>
          </div>
          <Image
            alt="Hero"
            className="mx-auto aspect-[2/1] overflow-hidden rounded-xl object-cover"
            height="400"
            src="https://res.cloudinary.com/drheg5d7j/image/upload/v1713928258/Screenshot_2024-04-23_at_8.07.19_PM_2_uut2mq.webp"
            width="1270"
          />
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container space-y-16 px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-stone-100 px-3 py-1 text-sm dark:bg-stone-800">
                New Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Connect your communication channels.
              </h2>
              <p className="max-w-[900px] text-stone-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-stone-400">
                Team Send is the only platform that allows you to connect all
                your informal communication channels in one place. Coordinate
                with your team across all platforms.
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
                Connect to your GroupMe groups and add bots that can send and
                listen to messages.
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
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Up next...
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start justify-center gap-4 sm:flex-row">
            <ButtonLink href="/login">See for yourself</ButtonLink>
          </div>
        </div>
      </section>
    </Layout>
  );
}
