import { useAutoAnimate } from "@formkit/auto-animate/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { type UseFormReturn, useForm } from "react-hook-form";

import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";
import { getInitialSelectedMembers } from "@/lib/utils";
import type { MemberBaseContact } from "@/server/api/routers/contact";
import { api } from "@/utils/api";
import type { IReminder, RecurPeriod } from "@/server/api/routers/message";
import { getServerAuthSession } from "@/server/auth";
import useDataTable from "@/hooks/useDataTable";
import { db } from "@/server/db";

import GroupMembersTable from "@/components/group/GroupMembersTable";
import { MessageSettings } from "@/components/group/MessageSettings";
import {
  defaultReminder,
  groupMessageSchema,
  type GroupMessageSchema,
  type GroupMessageType,
} from "@/components/group/groupMessageSchema";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CheckboxInput, FormTextarea } from "@/components/ui/form-inputs";
import { toast } from "@/components/ui/use-toast";
import PageLayout from "@/layouts/PageLayout";
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

// clean up + commit

// add better validation to create

// default sorting for tables

// sentry + axiom

// history
// display recipient count not member count (change text?)

export default function EditMessage({ messageId }: MessageDetailsProps) {
  const { data } = api.message.getMessageById.useQuery({ messageId });

  const form = useForm<GroupMessageType>({
    resolver: zodResolver(groupMessageSchema),
    defaultValues: {
      id: messageId,
      status: data?.status,
      content: data?.content,
      isScheduled: data?.isScheduled ? "yes" : "no",
      scheduledDate: data?.scheduledDate,
      isRecurring: data?.isRecurring ? "yes" : "no",
      recurringNum: data?.recurringNum,
      recurringPeriod: data?.recurringPeriod ?? ("weeks" as RecurPeriod),
      isReminders: data?.isReminders ? "yes" : "no",
      reminders: (data?.reminders?.length
        ? data?.reminders
        : [defaultReminder]) as IReminder[],
      saveRecipientState: true,
      recipients: getInitialSelectedMembers(data?.recipients ?? []),
    },
  });

  const { table } = useDataTable({
    columns: getGroupMembersColumns(form),
    data: data?.recipients ?? [],
    getRowId: (row: MemberBaseContact) => row.id,
    enableRowSelection: (row) =>
      !!row.original.contact.phone || !!row.original.contact.email,
    options: {
      rowSelection: {
        initial: getInitialSelectedMembers(data?.recipients ?? []),
      },
    },
  });

  const router = useRouter();
  const { mutate, isLoading: isUpdating } = api.message.update.useMutation({
    onSuccess: async (data) => {
      await router.push(`/group/${data.groupId}/message/${data.id}`);
      if (data.status === "sent") {
        toast({
          title: "Message Sent",
          description: `Message "${data.id}" has been sent.`,
        });
      } else {
        toast({
          title: "Message Updated",
          description: `Message "${data.id}" has been updated.`,
        });
      }
    },
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors?.content;
      if (errorMessage?.[0]) {
        toast({
          title: "Message Update Failed",
          description: errorMessage[0],
          variant: "destructive",
        });
      } else {
        toast({
          title: "Message Update Failed",
          description:
            "An error occurred while updating the message. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const [updatingToast, setUpdatingToast] =
    useState<ReturnType<typeof toast>>();
  useEffect(() => {
    if (isUpdating && !updatingToast) {
      setUpdatingToast(
        toast({
          title: "Updating Message",
          description: "Please wait while we update your message.",
        }),
      );
    } else if (updatingToast && !isUpdating) {
      updatingToast.dismiss();
      setUpdatingToast(undefined);
    }

    return () => {
      if (updatingToast) {
        updatingToast.dismiss();
        setUpdatingToast(undefined);
      }
    };
  }, [updatingToast, isUpdating]);

  const onSubmit = (formData: GroupMessageType) => {
    if (formData.isScheduled === "yes" && !formData.scheduledDate) {
      formData.isScheduled = "no";
    }
    if (formData.isScheduled === "no") {
      formData.scheduledDate = null;
      formData.isReminders = "no";
    }

    formData.reminders = Array.from(
      new Map(
        formData.reminders
          ?.filter((reminder) => reminder.num && reminder.period)
          .map((reminder) => [`${reminder.num}-${reminder.period}`, reminder]),
      ).values(),
    );

    console.log(formData.reminders);

    if (formData.isReminders === "yes" && !formData.reminders?.length) {
      formData.isReminders = "no";
    } else if (formData.isReminders === "no") {
      formData.reminders = [];
    }

    if (
      formData.isRecurring === "yes" &&
      !(formData.recurringNum && formData.recurringPeriod)
    ) {
      formData.isRecurring = "no";
    } else if (formData.isRecurring === "no") {
      formData.recurringNum = null;
      formData.recurringPeriod = null;
    }

    mutate({
      ...formData,
      isRecurring: formData.isRecurring === "yes",
      isScheduled: formData.isScheduled === "yes",
      isReminders: formData.isReminders === "yes",
    });
  };

  const { mutate: deleteMessage } = api.message.delete.useMutation({
    onSuccess: (data) => {
      void router.push(`/group/${data.groupId}/history`);
      toast({
        title: "Message Deleted",
        description: `Message "${data.id}" has been deleted.`,
      });
    },
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors?.content;
      if (errorMessage?.[0]) {
        toast({
          title: "Message Delete Failed",
          description: errorMessage[0],
          variant: "destructive",
        });
      } else {
        toast({
          title: "Message Delete Failed",
          description:
            "An error occurred while deleting the message. Please try again.",
          variant: "destructive",
        });
      }
    },
  });
  const handleDelete = () => deleteMessage({ messageId });

  const [parent] = useAutoAnimate();

  if (!data) return <div>404</div>;

  return (
    <PageLayout
      title={`Edit Message ${messageId}`}
      description={`Status: ${data?.status.charAt(0).toUpperCase() + data?.status.slice(1)}`}
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
            description="This message will be sent to all selected group members."
            placeholder="Enter a message"
            required={true}
          />
          <Button type="submit" disabled={isUpdating}>
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
                checkboxes below.
              </p>
            </div>
            <CheckboxInput<GroupMessageSchema>
              name="saveRecipientState"
              label="Save recipient state for group"
              description="Recipients you choose for this message will become the new default for this group."
              control={form.control}
            />
            <GroupMembersTable table={table} />
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
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  const messageId = context.params?.messageId;
  const groupId = context.params?.groupId;

  if (typeof messageId !== "string" || typeof groupId !== "string") {
    throw new Error("Invalid slug");
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
      messageId,
    },
  };
};

type MessageDetailsProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

import type { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";

import { HoverableCell } from "@/components/ui/hover-card";
import {
  DataTableColumnHeader,
  DataTableRowActions,
} from "@/components/ui/data-table";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { parsePhoneNumber } from "libphonenumber-js";
import { useEffect, useState } from "react";

const getGroupMembersColumns = (
  form: UseFormReturn<GroupMessageType>,
): ColumnDef<MemberBaseContact>[] => {
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
            // TODO
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
                [row.original.id]: !row.getIsSelected(),
              });
            }}
            aria-label="Select row"
            name="select-row"
            disabled={
              !row.original.contact.phone && !row.original.contact.email
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
      accessorKey: "contact.name",
      id: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
    },
    {
      accessorKey: "contact.email",
      id: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
    },
    {
      accessorKey: "contact.phone",
      id: "phone",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
      cell: ({ row }) => {
        const phoneString = row.original.contact?.phone;
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
            onClick={() =>
              navigator.clipboard.writeText(row.getValue<string>("id"))
            }
            className="w-48"
          >
            Copy member ID
            <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              navigator.clipboard.writeText(row.original.contact.id)
            }
            className="w-48"
          >
            Copy member ID
            <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <Link href={`/contact/${row.original.contact.id}`}>
            <DropdownMenuItem>View contact details</DropdownMenuItem>
          </Link>
          <DropdownMenuItem>
            Remove from group
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DataTableRowActions>
      ),
    },
  ];
};
