import { SidebarLayout } from "./SidebarLayout";

const sidebarNavItems = [
  {
    title: "Profile",
    href: `/account/profile`,
  },
  {
    title: "Billing",
    href: `/account/billing`,
  },
  {
    title: "Settings",
    href: `/account/settings`,
  },
];

interface AccountLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string | null;
}

export function AccountLayout({ children, ...props }: AccountLayoutProps) {
  return (
    <SidebarLayout {...props} sidebarNavItems={sidebarNavItems}>
      {children}
    </SidebarLayout>
  );
}
