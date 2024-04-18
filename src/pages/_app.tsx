import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { api } from "@/utils/api";

import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <div className={`font-sans ${inter.variable}`}>
        <Component {...pageProps} />
      </div>
      <SpeedInsights />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
