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
  title: string;
  description: string | null;
  groupId: string;
}

export function GroupLayout({
  children,
  title,
  description,
  groupId,
}: GroupLayoutProps) {
  return (
    <SidebarLayout
      title={title}
      description={description}
      sidebarNavItems={getSidebarNavItems(groupId)}
    >
      {children}
    </SidebarLayout>
  );
}
