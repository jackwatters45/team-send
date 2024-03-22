import { SidebarNav, type SidebarNavItems } from "@/components/nav/SidebarNav";
import PageLayout from "./PageLayout";

interface SidebarLayoutProps {
  children: React.ReactNode;
  sidebarNavItems: SidebarNavItems;
  title: string;
  description: string | null;
}

export function SidebarLayout({
  children,
  sidebarNavItems,
  description,
  title,
}: SidebarLayoutProps) {
  return (
    <PageLayout title={title} description={description}>
      <aside className="-ml-4 lg:w-1/5">
        <SidebarNav items={sidebarNavItems} />
      </aside>
      <div className="flex-1">{children}</div>
    </PageLayout>
  );
}