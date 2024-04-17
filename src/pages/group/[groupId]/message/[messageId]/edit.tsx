import React from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { useForm } from "react-hook-form";
import { TRPCClientError } from "@trpc/client";
import Link from "next/link";
import { parsePhoneNumber } from "libphonenumber-js";
import { type UseFormReturn } from "react-hook-form";
import type { Reminder } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";

import type { MemberSnapshotWithContact } from "@/server/api/routers/member";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";
import {
  capitalize,
  getInitialSelectedMembersSnapshot,
  utcToLocalDateTimeString,
} from "@/lib/utils";
import { api } from "@/utils/api";
import { defaultReminder } from "@/schemas/reminderSchema.ts";
import { getServerAuthSession } from "@/server/auth";
import useDataTable from "@/hooks/useDataTable";
import { validateMessageForm } from "@/lib/validations";
import { db } from "@/server/db";

import PageLayout from "@/layouts/PageLayout";
import GroupMembersTable from "@/components/group/GroupMembersTable";
import { MessageSettings } from "@/components/group/MessageSettings";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CheckboxInput, FormTextarea } from "@/components/ui/form-inputs";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  type MessageFormType,
  messageFormSchema,
} from "@/schemas/messageSchema";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DataTableColumnHeader,
  DataTableRowActions,
} from "@/components/ui/data-table";
import { HoverableCell } from "@/components/ui/hover-card";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { renderErrorComponent } from "@/components/error/renderErrorComponent";

export default function EditMessage({
  groupId,
  messageId,
}: MessageDetailsProps) {
  const { data, error } = api.message.getMessageById.useQuery({ messageId });

  const ctx = api.useUtils();
  const { mutate: deleteMember } = api.member.delete.useMutation({
    onSuccess: async (data) => {
      await ctx.group.getGroupById.invalidate({ groupId });
      toast({
        title: "Member deleted",
        description: `Member ${data?.id} has been deleted`,
      });
    },
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors?.content;
      toast({
        title: "Member deletion failed",
        description:
          errorMessage?.[0] ??
          error.message ??
          "An error occurred while deleting the member",
        variant: "destructive",
      });
    },
  });
  const handleDeleteMember = (memberId: string) => deleteMember({ memberId });

  const form = useForm<MessageFormType>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      id: messageId,
      groupId,
      status: data?.status,
      type: data?.type,
      content: data?.content,
      isScheduled: data?.isScheduled ? "yes" : "no",
      scheduledDate: utcToLocalDateTimeString(data?.scheduledDate),
      isRecurring: data?.isRecurring ? "yes" : "no",
      recurringNum: data?.recurringNum,
      recurringPeriod: data?.recurringPeriod ?? "weeks",
      isReminders: data?.isReminders ? "yes" : "no",
      reminders: (data?.reminders?.length
        ? data?.reminders
        : [defaultReminder]) as Reminder[],
      saveRecipientState: true,
      recipients: getInitialSelectedMembersSnapshot(data?.recipients ?? []),
    },
  });

  const [isTableDirty, setIsTableDirty] = React.useState(false);
  const columns = getSnapshotRecipientsColumns({
    form,
    setIsTableDirty,
    handleDeleteMember,
  });
  const { table } = useDataTable({
    columns,
    data: data?.recipients ?? [],
    getRowId: (row) => row.id,
    enableRowSelection: (row) =>
      !!row.original.member.contact.phone ||
      !!row.original.member.contact.email,
    options: {
      rowSelection: {
        initial: getInitialSelectedMembersSnapshot(data?.recipients ?? []),
      },
    },
  });

  const router = useRouter();
  // const { mutate } = api.message.update.useMutation({
  //   onSuccess: async (data) => {
  //     await router.push(`/group/${groupId}/message/${messageId}`);
  //     if (data?.status === "sent") {
  //       toast({
  //         title: "Message Sent",
  //         description: `Message "${data?.id}" has been sent.`,
  //       });
  //     } else {
  //       toast({
  //         title: "Message Updated",
  //         description: `Message "${data?.id}" has been updated.`,
  //       });
  //     }
  //   },
  //   onError: (error) => {
  //     const errorMessage = error.data?.zodError?.fieldErrors?.content;
  //     toast({
  //       title: "Message Update Failed",
  //       description:
  //         errorMessage?.[0] ??
  //         error.message ??
  //         "An error occurred while updating the message. Please try again.",
  //       variant: "destructive",
  //     });
  //   },
  // });

  const { mutate } = api.message.send.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Message sent",
        description: JSON.stringify(data),
      });
    },
    onError: (err) => {
      console.log("Error sending message", err);
    },
  });

  const onSubmit = (formData: MessageFormType) => {
    const data = validateMessageForm(formData);

    toast({
      title: "Updating Message",
      description: "Please wait while we update your message.",
    });

    mutate(data);
  };

  const { mutate: deleteMessage } = api.message.delete.useMutation({
    onSuccess: async (data) => {
      await router.push(`/group/${data.groupId}/history`);
      toast({
        title: "Message Deleted",
        description: `Message "${data.id}" has been deleted.`,
      });
    },
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors?.content;
      toast({
        title: "Message Delete Failed",
        description:
          errorMessage?.[0] ??
          error.message ??
          "An error occurred while deleting the message. Please try again.",
        variant: "destructive",
      });
    },
  });
  const handleDelete = () => deleteMessage({ messageId });

  const [parent] = useAutoAnimate();

  if (!data) return renderErrorComponent(error);

  return (
    <PageLayout
      title={`Edit Message ${messageId}`}
      description={`Current Status: ${data?.status.charAt(0).toUpperCase() + data?.status.slice(1)}`}
      rightSidebar={<DeleteButton onClick={handleDelete} />}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col gap-8 sm:gap-6"
          ref={parent}
        >
          <MessageSettings form={form} />
          <FormTextarea
            control={form.control}
            name="content"
            label="Message"
            description="This message will be sent to all selected group members"
            placeholder="Enter a message"
            required={true}
          />
          <Button
            type="submit"
            disabled={
              !(isTableDirty || form.formState.isDirty) ||
              !form.formState.isValid
            }
          >
            {form.watch("isScheduled") === "yes"
              ? "Schedule Message"
              : "Send Message"}
          </Button>
          <div className="border-b dark:border-stone-500 dark:border-opacity-20" />
          <div>
            <div>
              <h3 className="text-medium text-lg">Message Recipients</h3>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Selected users will receive this message. You can change
                recipients by selecting or deselecting users using the
                checkboxes below
              </p>
            </div>
            <CheckboxInput<typeof messageFormSchema>
              name="saveRecipientState"
              label="Save recipient state for group"
              description="Recipients you choose for this message will become the new default for this group"
              control={form.control}
            />
            <GroupMembersTable table={table} columns={columns} />
          </div>
        </form>
      </Form>
    </PageLayout>
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild className="w-full">
        <Button variant="destructive">Delete</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onClick}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext<{ messageId: string; groupId: string }>,
) => {
  const session = await getServerAuthSession(context);
  if (!session) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  const messageId = context.params?.messageId;
  const groupId = context.params?.groupId;

  if (typeof messageId !== "string" || typeof groupId !== "string") {
    throw new TRPCClientError("Invalid slug");
  }

  const message = await db.message.findUnique({
    where: { id: messageId },
    select: { status: true },
  });

  if (message?.status === "sent") {
    return {
      redirect: {
        destination: `/group/${groupId}/message/${messageId}`,
        permanent: false,
      },
    };
  }

  const helpers = genSSRHelpers(session);
  await helpers.message.getMessageById.prefetch({ messageId });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      groupId,
      messageId,
    },
  };
};

type MessageDetailsProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

export const getSnapshotRecipientsColumns = ({
  form,
  setIsTableDirty,
  handleDeleteMember,
}: {
  form: UseFormReturn<MessageFormType>;
  setIsTableDirty: React.Dispatch<React.SetStateAction<boolean>>;
  handleDeleteMember: (memberId: string) => void;
}): ColumnDef<MemberSnapshotWithContact>[] => {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            form.setValue(
              "recipients",
              Object.keys(form.getValues("recipients")).reduce(
                (acc, key) => ({ ...acc, [key]: !!value }),
                {},
              ),
            );
            setIsTableDirty(true);
          }}
          aria-label="Select all"
          name="select-all"
          disabled={table.getRowCount() === 0}
        />
      ),
      cell: ({ row }) => {
        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
              form.setValue("recipients", {
                ...form.getValues("recipients"),
                [row.original.id]: !!value,
              });
              setIsTableDirty(true);
            }}
            aria-label="Select row"
            name="select-row"
            disabled={
              !row.original.member.contact.phone &&
              !row.original.member.contact.email
            }
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
    },
    {
      accessorKey: "member.contact.name",
      id: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
    },
    {
      accessorKey: "member.contact.email",
      id: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
    },
    {
      accessorKey: "member.contact.phone",
      id: "phone",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
      cell: ({ row }) => {
        const phoneString = row.original.member.contact?.phone;
        if (!phoneString) return null;

        const phone = parsePhoneNumber(phoneString);
        return phone ? phone.formatNational() : phoneString;
      },
    },
    {
      accessorKey: "memberNotes",
      id: "notes",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Notes"
          className="flex-1"
        />
      ),
      cell: ({ row }) => <HoverableCell value={row.original.memberNotes} />,
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <DataTableRowActions>
          <DropdownMenuItem
            onClick={async () => {
              await navigator.clipboard.writeText(row.getValue<string>("id"));

              toast({
                title: "Copied member ID",
                description: `Member ID ${row.getValue<string>("id")} has been copied to your clipboard`,
              });
            }}
            className="w-48"
          >
            Copy member ID
            {/* <DropdownMenuShortcut>⌘C</DropdownMenuShortcut> */}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              await navigator.clipboard.writeText(
                row.original.member.contact.id,
              );

              toast({
                title: "Copied contact ID",
                description: `Contact ID ${row.original.member.contact.id} has been copied to your clipboard`,
              });
            }}
            className="w-48"
          >
            Copy contact ID
            {/* <DropdownMenuShortcut>⌘C</DropdownMenuShortcut> */}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <Link href={`/contact/${row.original.member.contact.id}`}>
            <DropdownMenuItem>View contact details</DropdownMenuItem>
          </Link>
          <DropdownMenuItem
            onClick={() => handleDeleteMember(row.getValue<string>("id"))}
          >
            Remove from group
            {/* <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut> */}
          </DropdownMenuItem>
        </DataTableRowActions>
      ),
    },
  ];
};
