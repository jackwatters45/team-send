import { type getProviders, signIn } from "next-auth/react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type Providers = Awaited<ReturnType<typeof getProviders>>;

export default function AlternateLogins({
  providers,
}: {
  providers: Providers;
}) {
  return (
    <div className="flex flex-col items-center gap-2 pt-8">
      <span className="text-sm font-bold text-neutral-500">
        Or continue with
      </span>
      <div className="flex gap-3">
        {providers &&
          Object.values(providers).map((provider) => (
            <button
              key={provider.name}
              className="cursor-pointer rounded-full bg-none p-2 hover:bg-black hover:bg-opacity-5 dark:hover:bg-stone-50 dark:hover:bg-white dark:hover:bg-opacity-10"
              onClick={async (e) => {
                e.preventDefault();
                await signIn(provider.id);
              }}
            >
              <Image
                src={getProviderIcon(provider.id)}
                alt={`login with ${provider.name}`}
                className={cn(
                  "w-10 ",
                  provider.id === "github" ? "dark:invert" : "",
                )}
                contextMenu="("
                width={40}
                height={40}
              />
            </button>
          ))}
      </div>
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
