import Link from "next/link";
import { Fragment } from "react";
import { useForm } from "react-hook-form";
import type { GetStaticPropsContext, InferGetStaticPropsType } from "next";

import useProtectedPage from "@/hooks/useProtectedRoute";
import { api } from "@/utils/api";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";
import { type ContactBase } from "@/server/api/routers/contact";
import extractInitials from "@/lib/extractInitials";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PageLayout from "@/layouts/PageLayout";
import { Separator } from "@/components/ui/separator";
import { Form } from "@/components/ui/form";
import { FormInput, FormTextarea } from "@/components/ui/form-inputs";
import { Button } from "@/components/ui/button";

export default function Contact({ contactId }: ContactProps) {
  useProtectedPage();

  const { data } = api.contact.getContactById.useQuery({ contactId });

  const form = useForm<ContactBase>({
    defaultValues: {
      name: data?.name ?? "",
      email: data?.email ?? "",
      phone: data?.phone ?? "",
      notes: data?.notes ?? "",
    },
  });

  const onSubmit = (data: ContactBase) => {
    console.log(data);
  };

  if (!data) {
    return <div>404</div>;
  }

  return (
    <PageLayout title={data?.name} description={`User ID: ${contactId}`}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col gap-8"
        >
          <h2 className="text-lg font-semibold">Edit Details</h2>
          <FormInput
            label="Name"
            name="name"
            placeholder="Name"
            control={form.control}
          />
          <FormInput
            label="Email"
            name="email"
            placeholder="Email"
            type="email"
            control={form.control}
          />
          <FormInput
            label="Phone"
            name="phone"
            placeholder="Phone"
            type="tel"
            control={form.control}
          />
          <FormTextarea
            label="Notes"
            name="notes"
            placeholder="Notes"
            control={form.control}
          />
          <Button type="submit">Save Changes</Button>
        </form>
      </Form>
      <div className="border-b lg:hidden dark:border-stone-500 dark:border-opacity-20" />
      {data.groups && data.groups.length > 0 ? (
        <div className="lg:w-1/3">
          <div className="font-semibold">Groups</div>
          <div className="space-y-2">
            {data.groups.map((group, i) => {
              return (
                <Fragment key={group?.id}>
                  <Link
                    href={`/group/${group?.id}`}
                    className="flex items-center gap-2 rounded-md p-2"
                  >
                    <Avatar>
                      <AvatarImage
                        src={group.image ?? undefined}
                        alt={group.name}
                      />
                      <AvatarFallback>
                        {extractInitials(group.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">{group.name}</h4>
                      <div className="text-xs">
                        {group.members.length} members
                      </div>
                      <div className="text-xs text-stone-500">
                        {group.description}
                      </div>
                    </div>
                  </Link>
                  {i !== data.groups.length - 1 && <Separator />}
                </Fragment>
              );
            })}
          </div>
        </div>
      ) : null}
    </PageLayout>
  );
}

export const getStaticProps = async (
  context: GetStaticPropsContext<{ contactId: string }>,
) => {
  const helpers = genSSRHelpers();

  const contactId = context.params?.contactId;
  if (typeof contactId !== "string") {
    throw new Error("Invalid slug");
  }

  await helpers.contact.getContactById.prefetch({ contactId });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      contactId,
    },
  };
};

export const getStaticPaths = () => ({
  paths: [],
  fallback: "blocking",
});

type ContactProps = InferGetStaticPropsType<typeof getStaticProps>;
