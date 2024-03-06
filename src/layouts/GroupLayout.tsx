import type { GroupPreview } from "@/server/api/routers/group";
import { SidebarNav } from "@/components/Group/SidebarNav";
import { useRouter } from "next/router";
import PageLayout from "./PageLayout";

const getSidebarNavItems = (groupId: string) => [
  {
    title: "Send",
    href: `/group/${groupId}`,
  },
  {
    title: "Recipients",
    href: `/group/${groupId}/recipients`,
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
  groupData: GroupPreview;
}

export function GroupLayout({ children, groupData }: GroupLayoutProps) {
  const router = useRouter();
  const sidebarNavItems = getSidebarNavItems(router.query.groupId as string);

  return (
    <PageLayout title={groupData.name} description={groupData.description}>
      <aside className="-ml-4 lg:w-1/5">
        <SidebarNav items={sidebarNavItems} />
      </aside>
      <div className="flex-1 lg:max-w-2xl">{children}</div>
    </PageLayout>
  );
}
