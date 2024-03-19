import { useRouter } from "next/router";

import {
  formatRelativeDateAndTime,
  formatShortRelativeDate,
} from "@/lib/dateHelpers";
import { api } from "@/utils/api";
import { type IContact } from "@/server/api/routers/contact";
import useDataTable from "@/hooks/useDataTable";

import PageLayout from "@/layouts/PageLayout";
import GroupMembersTable from "@/components/group/group-members-table/GroupMembersTable";
import { getGroupMembersColumns } from "@/components/group/group-members-table/groupMembersColumns";
import { Separator } from "@/components/ui/separator";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function useMessageDetails() {
  const messageId = useRouter().query.messageId as string;
  const { data: messageData } = api.message.getMessageData.useQuery(messageId);

  const messageDate = formatRelativeDateAndTime(messageData?.time as string);

  const { table } = useDataTable({
    columns: getGroupMembersColumns(),
    data: messageData?.recipients ?? [],
    getRowId: (row: IContact) => row.id,
    includeRowSelection: false,
  });

  return { messageDate, messageData, table };
}

function EditMessageButton() {
  const messageId = useRouter().query.messageId as string;
  const groupId = useRouter().query.groupId as string;

  return (
    <Link
      href={`/group/${groupId}/message/${messageId}/edit`}
      className="block"
    >
      <Button variant={"secondary"}>Edit</Button>
    </Link>
  );
}

export default function MessageDetails() {
  const { messageData, messageDate, table } = useMessageDetails();
  return messageData ? (
    <PageLayout
      title={`Message ${messageData.id}`}
      description={`Last edited ${formatShortRelativeDate(messageData.time)}`}
      rightSidebar={<EditMessageButton />}
    >
      <div className="flex w-full flex-col gap-8">
        <div className="space-y-1">
          <div className="font-semibold">Sent by</div>
          <div className="text-sm">{messageData.sender.name}</div>
        </div>
        <div className="space-y-1">
          <div className="font-semibold">Created</div>
          <div className="text-sm">
            {messageDate.date} at {messageDate.time}
          </div>
        </div>
        <div className="border-b dark:border-stone-500 dark:border-opacity-20" />
        <div className="space-y-1">
          <div className="text-lg font-semibold">Content</div>
          <div className="text-sm">{messageData.content}</div>
        </div>
        <div className="border-b dark:border-stone-500 dark:border-opacity-20 " />
        <div className="space-y-1">
          <div className="font-semibold ">Recurring</div>
          <div className="flex items-center space-x-4 text-sm ">
            <div>{messageData.isRecurring ? "Yes" : "No"}</div>
            <Separator orientation="vertical" className="h-5" />
            {messageData.isRecurring &&
              messageData.recurringPeriod &&
              messageData.recurringNum && (
                <div>
                  Every {messageData.recurringNum} {messageData.recurringPeriod}
                  {messageData.recurringNum > 1 ? "s" : ""}
                </div>
              )}
          </div>
        </div>
        <div className="space-y-1">
          <div className="font-semibold">Reminders</div>
          <div className="flex items-center space-x-4 text-sm ">
            <div>{messageData.isReminders ? "Yes" : "No"}</div>
            <Separator orientation="vertical" className="h-5" />
            {messageData.reminders &&
              messageData.isReminders &&
              messageData.reminders.map((reminder, index) => (
                <Fragment key={index}>
                  <div>
                    {reminder.num} {reminder.period}
                  </div>
                  {messageData.reminders &&
                    index < messageData.reminders.length - 1 && (
                      <Separator orientation="vertical" className="h-5" />
                    )}
                </Fragment>
              ))}
          </div>
        </div>
        <div>
          <div className="font-semibold">Scheduled</div>
          <div className="flex items-center space-x-4 text-sm ">
            <div className="text-sm">
              {messageData.isScheduled ? "Yes" : "No"}
            </div>
            <Separator orientation="vertical" className="h-5" />
            {messageData.scheduledDate && messageData.scheduledDate && (
              <div>{new Date(messageData.scheduledDate).toLocaleString()}</div>
            )}
          </div>
        </div>
        <div className="border-b dark:border-stone-500 dark:border-opacity-20 " />
        <div>
          <div className="font-semibold">Message Recipients</div>
          <div className="text-sm ">
            {messageData.recipients.length} recipients
          </div>
        </div>
        <GroupMembersTable
          table={table}
          isLoading={!messageData.recipients}
          placeholder="Search recipients"
        />
      </div>
    </PageLayout>
  ) : null;
}
