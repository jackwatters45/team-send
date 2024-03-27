import Link from "next/link";
import { Fragment } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";

import { getServerAuthSession } from "@/server/auth";
import { api } from "@/utils/api";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";
import { type ContactBaseWithId } from "@/server/api/routers/contact";
import { extractInitials } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PageLayout from "@/layouts/PageLayout";
import { Separator } from "@/components/ui/separator";
import { Form } from "@/components/ui/form";
import { FormInput, FormTextarea } from "@/components/ui/form-inputs";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const contactBaseSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z
    .string()
    .or(
      z
        .string()
        .email()
        .refine((val) => val !== "", "Invalid email"),
    )
    .nullish(),
  phone: z.string().nullish(),
  notes: z.string().nullish(),
});

// TODO commits
// make index protect + make sure create is fine
// TODO add userId to pages
export default function Contact({ contactId }: ContactProps) {
  const { data } = api.contact.getContactById.useQuery({ contactId });

  const form = useForm<ContactBaseWithId>({
    resolver: zodResolver(contactBaseSchema),
    defaultValues: {
      id: contactId,
      name: data?.name,
      email: data?.email ?? "",
      phone: data?.phone ?? "",
      notes: data?.notes ?? "",
    },
  });

  const { mutate } = api.contact.update.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Contact Updated",
        description: `Contact "${data.name}" has been updated.`,
      });
    },
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors?.content;
      if (errorMessage?.[0]) {
        toast({
          title: "Contact Update Failed",
          description: errorMessage[0],
          variant: "destructive",
        });
      } else {
        toast({
          title: "Contact Update Failed",
          description:
            "An error occurred while updating the contact. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  if (!data) {
    return <div>404</div>;
  }

  return (
    <PageLayout title={data?.name} description={`Contact ID: ${contactId}`}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => mutate(data))}
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

export const getServerSideProps = async (
  context: GetServerSidePropsContext<{ contactId: string }>,
) => {
  const contactId = context.params?.contactId;
  if (typeof contactId !== "string") {
    throw new Error("Invalid slug");
  }

  const session = await getServerAuthSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const helpers = genSSRHelpers(session);
  await helpers.contact.getContactById.prefetch({ contactId });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      contactId,
    },
  };
};

type ContactProps = InferGetServerSidePropsType<typeof getServerSideProps>;
