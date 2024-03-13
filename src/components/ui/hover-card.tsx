import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { type Row } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import extractInitials from "@/lib/extractInitials";
import { type IUser } from "@/server/api/routers/auth";
import { parsePhoneNumber } from "libphonenumber-js";
import { Separator } from "./separator";
import { ScrollArea } from "./scroll-area";
import { type IMember } from "@/server/api/routers/contact";
import { formatRelativeDateAndTime } from "@/lib/dateHelpers";

const HoverCard = HoverCardPrimitive.Root;

const HoverCardTrigger = HoverCardPrimitive.Trigger;

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-50 w-64 rounded-md border border-stone-200 bg-white p-4 text-stone-950 shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-50",
      className,
    )}
    {...props}
  />
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

interface HoverableCellProps<T> {
  row: Row<T>;
  accessorKey: string;
  truncateLength?: number;
}
function HoverableCell<T>({
  row,
  accessorKey,
  truncateLength = 20,
}: HoverableCellProps<T>) {
  const value = row.getValue<string>(accessorKey);

  const triggerText =
    value.length > truncateLength
      ? `${value.slice(0, truncateLength)}...`
      : value;

  return (
    <HoverCard>
      <HoverCardTrigger>{triggerText}</HoverCardTrigger>
      <HoverCardContent className="text-xs">{value}</HoverCardContent>
    </HoverCard>
  );
}

interface IUserHoverableCellProps {
  user: IUser;
}
function UserHoverableCell({ user }: IUserHoverableCellProps) {
  return (
    <HoverCard>
      <HoverCardTrigger>{user.name}</HoverCardTrigger>
      <HoverCardContent className="text-xs">
        <div className="flex justify-between space-x-4">
          <Avatar>
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{extractInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">{user.name}</h4>
            {/* TODO something more better */}
            <p className="text-xs">
              The React Framework – created and maintained by @vercel.
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

interface IMemberHoverableCellProps {
  members: IMember[];
}
function MembersHoverableCell({ members }: IMemberHoverableCellProps) {
  return (
    <HoverCard>
      <HoverCardTrigger>{`${members.length} members`}</HoverCardTrigger>
      <HoverCardContent className="p-2">
        <ScrollArea
          className="data-[member-count=true]:h-[220px]"
          data-member-count={members.length > 3}
        >
          {members.map((member, i) => {
            const phoneNumber = member.phone
              ? parsePhoneNumber(member.phone)
              : null;

            return (
              <React.Fragment key={member.id}>
                <div className="flex items-center gap-2 rounded-md p-2">
                  <Avatar>
                    <AvatarFallback>
                      {extractInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 truncate">
                    <h4 className="text-sm font-semibold">{member.name}</h4>
                    <div className="flex flex-wrap text-xs text-stone-500">
                      {member.email && <div>{member.email}</div>}
                      {phoneNumber && member.email && (
                        <div className="mx-1">•</div>
                      )}
                      {phoneNumber && <div>{phoneNumber.formatNational()}</div>}
                    </div>
                  </div>
                </div>
                {i !== members.length - 1 && <Separator />}
              </React.Fragment>
            );
          })}
        </ScrollArea>
      </HoverCardContent>
    </HoverCard>
  );
}

interface DateHoverableCellProps {
  dateString: string;
}
function DateHoverableCell({ dateString }: DateHoverableCellProps) {
  const date = new Date(dateString);
  const { time, date: dateText } = formatRelativeDateAndTime(date);

  return (
    <HoverCard>
      <HoverCardTrigger>{`${dateText} ${time}`}</HoverCardTrigger>
      <HoverCardContent className="text-xs">
        {date.toLocaleString()}
      </HoverCardContent>
    </HoverCard>
  );
}

export {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  HoverableCell,
  UserHoverableCell,
  MembersHoverableCell,
  DateHoverableCell,
};
