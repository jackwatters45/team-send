import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";

import {
  cn,
  extractInitials,
  formatRelativeDateAndTime,
  truncateText,
} from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { type User } from "@/server/api/routers/auth";
import { parsePhoneNumber } from "libphonenumber-js";
import { Separator } from "./separator";
import { ScrollArea } from "./scroll-area";
import type { Member } from "@/server/api/routers/member";
import Link from "next/link";

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

interface HoverableCellProps {
  value: string | null | undefined;
  truncLength?: number;
}
function HoverableCell({ value, truncLength = 20 }: HoverableCellProps) {
  if (!value) return null;

  return (
    <HoverCard>
      <HoverCardTrigger>{truncateText(value, truncLength)}</HoverCardTrigger>
      <HoverCardContent className="text-xs">{value}</HoverCardContent>
    </HoverCard>
  );
}

interface IUserHoverableCellProps {
  user: User;
}
function UserHoverableCell({ user }: IUserHoverableCellProps) {
  return (
    <HoverCard>
      <HoverCardTrigger>{user.name}</HoverCardTrigger>
      <HoverCardContent className="text-xs">
        <div className="flex justify-between space-x-4">
          <Avatar>
            <AvatarImage src={user.image} />
            <AvatarFallback>{extractInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">{user.name}</h4>
            <p className="text-xs">
              {user.username ?? user.email ?? user.phone ?? user.id}
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

interface IMemberHoverableCellProps {
  members: Member[];
}
function MembersHoverableCell({ members }: IMemberHoverableCellProps) {
  if (!members) return null;

  return (
    <HoverCard>
      <HoverCardTrigger>{`${members?.length} member${
        members?.length > 1 ? "s" : ""
      }`}</HoverCardTrigger>
      <HoverCardContent className="w-96 p-2">
        <ScrollArea
          className="data-[member-count=true]:h-[220px]"
          data-member-count={members?.length > 3}
        >
          {members?.map(({ contact }, i) => {
            const phoneNumber = contact?.phone
              ? parsePhoneNumber(contact.phone)
              : null;

            return (
              <React.Fragment key={contact?.id}>
                <Link
                  href={`/contact/${contact?.id}`}
                  className="flex items-center gap-2 rounded-md p-2"
                >
                  <Avatar>
                    <AvatarFallback>
                      {extractInitials(contact.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 truncate">
                    <h4 className="text-sm font-semibold">{contact.name}</h4>
                    <div className="flex flex-wrap text-xs text-stone-500">
                      {contact.email && <div>{contact.email}</div>}
                      {phoneNumber && contact.email && (
                        <div className="mx-1">•</div>
                      )}
                      {phoneNumber && <div>{phoneNumber.formatNational()}</div>}
                    </div>
                  </div>
                </Link>
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
  dateInput: string | Date;
}
function DateHoverableCell({ dateInput }: DateHoverableCellProps) {
  const date = new Date(dateInput);
  const dateTime = formatRelativeDateAndTime(date);

  return (
    <HoverCard>
      <HoverCardTrigger>{`${dateTime?.date} ${dateTime?.time}`}</HoverCardTrigger>
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
