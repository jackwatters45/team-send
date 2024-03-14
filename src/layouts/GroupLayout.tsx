import { useRouter } from "next/router";

import type { IGroupBase } from "@/server/api/routers/group";
import { SidebarLayout } from "./SidebarLayout";

const getSidebarNavItems = (groupId: string) => [
  {
    title: "Send",
    href: `/group/${groupId}`,
  },
  {
    title: "Members",
    href: `/group/${groupId}/members`,
  },
  {
    title: "History",
    href: `/group/${groupId}/history`,
  },
  {
    title: "Settings",
    href: `/group/${groupId}/settings`,
  },
];

interface GroupLayoutProps {
  children: React.ReactNode;
  group: IGroupBase;
}

export function GroupLayout({ children, group }: GroupLayoutProps) {
  const sidebarNavItems = getSidebarNavItems(
    useRouter().query.groupId as string,
  );

  return (
    <SidebarLayout
      title={group.name}
      description={group.description}
      sidebarNavItems={sidebarNavItems}
    >
      {children}
    </SidebarLayout>
  );
}
