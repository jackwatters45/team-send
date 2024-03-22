import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signIn, signOut, useSession } from "next-auth/react";
import * as z from "zod";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function Login() {
  const { data: session } = useSession();

  return (
    <div
      className="flex h-screen items-center justify-center bg-stone-100
    bg-stone-950"
    >
      <Card className="w-[min(90vw,400px)] rounded-lg bg-white shadow-2xl">
        <CardHeader>
          <CardTitle>Team Send</CardTitle>
          <CardDescription>
            Easily send targeted bulk SMS to groups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LocalLogin />
          <AlternateLogins />
        </CardContent>
      </Card>
    </div>
  );
}

const formSchema = z.object({
  username: z
    .string()
    .min(6, {
      message: "Email must be at least 6 characters.",
    })
    .max(30, {
      message: "Email must be at most 40 characters.",
    }),

  password: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters.",
    })
    .max(50),
});

type FormData = z.infer<typeof formSchema>;

const LocalLogin = () => {
  const { data: sessionData } = useSession();

  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit((values: z.infer<typeof formSchema>) => {
    console.log(values);
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 text-neutral-500">
      <div className="relative rounded-lg border border-solid border-neutral-300 hover:border-neutral-400 dark:border-stone-300 dark:text-stone-300 dark:hover:border-stone-50">
        <label htmlFor="username" className="absolute left-4 top-3 text-xs ">
          Email
        </label>
        <input
          className="w-full rounded-lg px-4 pb-2 pt-7 text-lg dark:bg-stone-800"
          type="email"
          id="username"
          autoComplete="username"
          {...register("username")}
        />
      </div>
      <div className="relative rounded-lg border border-solid border-neutral-300 hover:border-neutral-400 dark:border-stone-300 dark:text-stone-300 dark:hover:border-stone-50">
        <label htmlFor="password" className="absolute left-4 top-3 text-xs ">
          Password
        </label>
        <input
          className="w-full rounded-lg px-4 pb-2 pt-7 text-lg dark:bg-stone-800"
          type={showPassword ? "text" : "password"}
          id="password"
          autoComplete="current-password"
          {...register("password")}
        />
        <button
          className="absolute right-3 top-6 text-sm font-semibold "
          onClick={toggleShowPassword}
          type="button"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
      <Button className="" type="submit">
        Continue
      </Button>
    </form>
  );
};

function AlternateLogins() {
  return (
    <div className="flex flex-col items-center gap-2 pt-8">
      <span className="text-sm font-bold text-neutral-500">
        Or continue with
      </span>
      <div className="flex gap-3">
        <button className="cursor-pointer rounded-full bg-none p-2 hover:bg-black hover:bg-opacity-5 dark:hover:bg-stone-50 dark:hover:bg-white dark:hover:bg-opacity-10">
          <a href={"http://localhost:3000/api/auth/callback/facebook"}>
            <Image
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-plain.svg"
              alt="login with facebook"
              className="w-10"
              width={40}
              height={40}
            />
          </a>
        </button>
        <button className="cursor-pointer rounded-full bg-none p-2 hover:bg-black hover:bg-opacity-5 dark:hover:bg-stone-50 dark:hover:bg-white dark:hover:bg-opacity-10">
          <a href={"http://localhost:3000/api/auth/callback/google"}>
            <Image
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
              alt="login with google"
              className="w-10"
              width={40}
              height={40}
            />
          </a>
        </button>
        <button className="cursor-pointer rounded-full bg-none p-2 hover:bg-black hover:bg-opacity-5 dark:hover:bg-stone-50 dark:hover:bg-white dark:hover:bg-opacity-10">
          <a href={"http://localhost:3000/api/auth/callback/github"}>
            <div className="rounded-full dark:bg-stone-300">
              <Image
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
                alt="login with github"
                className="w-10"
                width={40}
                height={40}
              />
            </div>
          </a>
        </button>
      </div>
    </div>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();

  // const { data: secretMessage } = api.post.getSecretMessage.useQuery(
  //   undefined, // no input
  //   { enabled: sessionData?.user !== undefined },
  // );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
}
