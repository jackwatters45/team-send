import { getProviders, signIn } from "next-auth/react";
import Image from "next/image";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { TRPCClientError } from "@trpc/client";

import { getServerAuthSession } from "@/server/auth";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

type LoginProps = InferGetServerSidePropsType<typeof getServerSideProps>;
export default function Login({ providers, error }: LoginProps) {
  return (
    <div
      className="flex h-screen items-center justify-center bg-stone-100
    dark:bg-stone-950"
    >
      <Card className="w-[min(90vw,400px)] rounded-lg bg-white shadow-2xl">
        <CardHeader>
          <CardTitle>Team Send</CardTitle>
          <CardDescription>
            Easily send targeted bulk SMS to groups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            {providers &&
              Object.values(providers).map((provider) => (
                <Button
                  key={provider.name}
                  variant={"outline"}
                  className="h-16 w-full py-4"
                  onClick={async (e) => {
                    e.preventDefault();
                    await signIn(provider.id);
                  }}
                >
                  <Image
                    src={getProviderIcon(provider.id)}
                    alt={`login with ${provider.name}`}
                    className={cn(
                      "w-8",
                      provider.id === "github" ? "dark:invert" : "",
                    )}
                    contextMenu="("
                    width={40}
                    height={40}
                  />
                  <span className="ml-4 text-base">{`Continue with ${provider.name}`}</span>
                </Button>
              ))}
          </div>
          {error && (
            <div className="pt-4 text-center text-sm text-red-500">
              {getAuthError(error)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getProviderIcon(providerId: string) {
  switch (providerId) {
    case "google":
      return "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg";
    case "facebook":
      return "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-plain.svg";
    case "github":
      return "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg";
    default:
      return "";
  }
}

function getAuthError(error: string | string[]) {
  if (Array.isArray(error)) {
    return "An error occurred while logging in. Please try again.";
  }

  switch (error) {
    case "OAuthAccountNotLinked":
      return "This account is already linked to another login method.";
    default:
      return "An error occurred while logging in. Please try again.";
  }
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (session) {
    return { redirect: { destination: "/" } };
  }

  const providers = await getProviders();
  if (!providers) {
    throw new TRPCClientError("Incorrect NEXTAUTH_URL or no providers added");
  }

  return {
    props: { providers: providers ?? [], error: ctx.query.error ?? null },
  };
}
