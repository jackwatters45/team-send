"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import * as z from "zod";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";

const formSchema = z.object({
  username: z
    .string()
    .min(6, {
      message: "Email must be at least 6 characters.",
    })
    .max(30, {
      message: "Email must be at most 40 characters.",
    }),
  // TODO
  password: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters.",
    })
    .max(50),
});

type FormData = z.infer<typeof formSchema>;

// TODO Autofill style, errors, functionality, zod

const LocalLogin = () => {
  const { data: sessionData } = useSession();

  // const { data: secretMessage } = api.post.getSecretMessage.useQuery(
  //   undefined, // no input
  //   { enabled: sessionData?.user !== undefined }
  // );

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

export default LocalLogin;
