import Router from "next/router";

import PageLayout from "@/layouts/PageLayout";
import {
  formatRelativeDateAndTime,
  formatShortRelativeDate,
} from "@/lib/dateHelpers";
import { api } from "@/utils/api";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import extractInitials from "@/lib/extractInitials";

// TODO extract component
export default function MessageDetails() {
  const messageId = Router.query.messageId as string;

  const messageData = api.message.getMessageData.useQuery(messageId)?.data;
  const messageDate = formatRelativeDateAndTime(messageData?.time as string);

  return messageData ? (
    <PageLayout
      title={`Message ${messageId}`}
      // description={messageData.content}
      description={`Last edited ${formatShortRelativeDate(messageData?.time as string)}`}
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
        <div className="border-b dark:border-stone-500 dark:border-opacity-20" />
        <div className="space-y-3">
          <div className="font-semibold">Recipients</div>
          <div className="flex flex-wrap gap-3">
            {messageData.recipients.map((recipient) => {
              return (
                <Badge key={recipient.id} className="py-1 text-sm">
                  <HoverCard>
                    <HoverCardTrigger href={`/contact/${recipient.id}`}>
                      {recipient.name}
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <div className="flex space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {extractInitials(recipient.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col justify-center">
                          <h4 className="text-sm font-semibold">
                            {recipient.name}
                          </h4>
                          {recipient.notes && (
                            <p className="text-xs">{recipient.notes}</p>
                          )}
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </Badge>
              );
            })}
          </div>
        </div>
        <div className="border-b dark:border-stone-500 dark:border-opacity-20 " />
        {/* TODO */}
        <div className="space-y-1">
          <div className="font-semibold ">Recurring</div>
          <div className="text-sm">
            {messageData.isRecurring ? "Yes" : "No"}
          </div>
          {messageData.isRecurring &&
            messageData.recurringPeriod &&
            messageData.recurringNum && (
              <div>
                {messageData.recurringNum} {messageData.recurringPeriod}
              </div>
            )}
        </div>
        {/* TODO */}
        <div className="space-y-1">
          <div className="font-semibold">Reminders</div>
          <div className="text-sm">
            {messageData.isReminders ? "Yes" : "No"}
            {messageData.reminders && messageData.isReminders && (
              <div>
                {messageData.reminders.map(
                  (reminder) => `${reminder.num} ${reminder.period}`,
                )}
              </div>
            )}
          </div>
        </div>
        {/* TODO */}
        <div>
          <div className="font-semibold">Scheduled</div>
          <div className="text-sm">
            {messageData.isScheduled ? "Yes" : "No"}
          </div>
          {messageData.scheduledDate && messageData.scheduledDate && (
            <div>{new Date(messageData.scheduledDate).toISOString()}</div>
          )}
        </div>
      </div>
    </PageLayout>
  ) : null;
}
