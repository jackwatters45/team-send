import type { IGroupPreview } from "@/server/api/routers/group";
import { GroupSidebarNav } from "@/components/group/GroupSidebarNav";
import { useRouter } from "next/router";
import PageLayout from "./PageLayout";

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
  group: IGroupPreview;
}

export function GroupLayout({ children, group: group }: GroupLayoutProps) {
  const sidebarNavItems = getSidebarNavItems(
    useRouter().query.groupId as string,
  );

  return (
    <PageLayout title={group.name} description={group.description}>
      <aside className="-ml-4 lg:w-1/5">
        <GroupSidebarNav items={sidebarNavItems} />
      </aside>
      <div className="flex-1">{children}</div>
    </PageLayout>
  );
}
