import { Fragment } from "react";
import Link from "next/link";

import extractInitials from "@/lib/extractInitials";
import { type IGroup } from "@/server/api/routers/group";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";

interface IContactGroupsProps {
  contactGroups: Array<IGroup>;
}

export default function ContactGroupCards({
  contactGroups,
}: IContactGroupsProps) {
  return (
    <div className="">
      <div className="font-semibold">Groups</div>
      <div className="space-y-2">
        {contactGroups?.map((group, i) => {
          return (
            <Fragment key={group.id}>
              <Link
                href={`/group/${group.id}`}
                className="flex items-center gap-2 rounded-md p-2"
              >
                <Avatar>
                  <AvatarImage src={group.avatar} alt={group.name} />
                  <AvatarFallback>{extractInitials(group.name)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">{group.name}</h4>
                  <div className="text-xs">{group.members.length} members</div>
                  <div className="text-xs text-stone-500">
                    {group.description}
                  </div>
                </div>
              </Link>
              {i !== contactGroups.length - 1 && <Separator />}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
