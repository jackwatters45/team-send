import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CopyIcon } from "@radix-ui/react-icons";
import { z } from "zod";
import type { GetServerSideProps } from "next";

import { api } from "@/utils/api";
import { getServerAuthSession } from "@/server/auth";
import extractInitials from "@/lib/extractInitials";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";

import { AccountLayout } from "@/layouts/AccountLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormDescription } from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-inputs";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const userSettingsSchema = z.object({
  name: z.string().max(40),
  image: z.string().optional(),
  "image-file": z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  username: z.string(),
});

type UserSettingsFormSchema = typeof userSettingsSchema;

type UserSettingsFormType = z.infer<typeof userSettingsSchema>;

export default function AccountProfile() {
  const { data: user } = api.auth.getCurrentUser.useQuery();

  const form = useForm<UserSettingsFormType>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      name: user?.name ?? "",
      image: user?.image ?? "",
      "image-file": "",
      email: user?.email ?? "",
      username: user?.username ?? "",
    },
  });

  const onSubmit = (data: UserSettingsFormType) => {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  };

  if (!user) {
    return null;
  }

  return (
    <AccountLayout
      title="User Profile"
      description={"Manage your account information"}
    >
      <Form {...form}>
        <div className="flex flex-col pb-4 pt-3">
          <h2 className="text-xl font-semibold tracking-tight">Edit Account</h2>
          <FormDescription>Make changes to your profile here.</FormDescription>
        </div>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-8 py-4 sm:gap-6"
        >
          <div className="flex-1 space-y-3">
            <div className="text-sm font-medium leading-none">User ID</div>
            <Button
              className="flex h-10 w-full items-center rounded-md border border-stone-200 bg-white px-3 py-2 text-start text-sm hover:bg-white dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-900"
              type="button"
              variant={"ghost"}
              onClick={() => {
                toast({
                  title: "Copied User ID",
                  description:
                    "Your user ID has been copied to your clipboard.",
                });
                return navigator.clipboard.writeText(user?.id);
              }}
            >
              <div className="flex-1">{user?.id}</div>
              <div className="hover: h-fit rounded-md p-1 hover:bg-stone-100 dark:hover:bg-stone-800">
                <CopyIcon className="h-4 w-4 text-stone-500 dark:text-stone-400" />
              </div>
            </Button>
          </div>
          <div className="flex justify-between gap-12">
            <div className="flex-1">
              <FormInput<UserSettingsFormSchema>
                name="image-file"
                label="Group Avatar"
                type="file"
                accept=".png, .jpg, .jpeg"
                className="dark:file:text-white "
                control={form.control}
              />
            </div>
            {(form.watch("name") ??
              form.watch("image") ??
              form.watch("image-file")) && (
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={form.watch("image-file") ?? form.watch("image")}
                  alt="Group Avatar"
                />
                <AvatarFallback className="text-4xl font-medium ">
                  {extractInitials(form.watch("name"))}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          <FormInput<UserSettingsFormSchema>
            control={form.control}
            name="name"
            label="Name"
            placeholder="Add your full Name"
          />
          <FormInput<UserSettingsFormSchema>
            control={form.control}
            name="username"
            label="Username"
            placeholder="Add a Username"
          />
          <FormInput<UserSettingsFormSchema>
            control={form.control}
            name="email"
            label="Email"
            placeholder="Add your email"
          />
          <FormInput<UserSettingsFormSchema>
            control={form.control}
            name="phone"
            label="Phone"
            placeholder="Add your phone number"
          />
          <div className="py-4">
            <Button type="submit" className="w-full">
              Save
            </Button>
          </div>
        </form>
      </Form>
    </AccountLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession(context);
  if (!session) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  const helpers = genSSRHelpers(session);
  await helpers.auth.getCurrentUser.prefetch();

  return { props: { trpcState: helpers.dehydrate() } };
};
