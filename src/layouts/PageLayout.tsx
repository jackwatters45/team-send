import Layout from "./Layout";

interface GroupLayoutProps {
  children: React.ReactNode;
  title: string | undefined;
  description: React.ReactNode | string | undefined | null;
  rightSidebar?: React.ReactNode;
}

export default function PageLayout({
  children,
  title,
  description,
  rightSidebar,
}: GroupLayoutProps) {
  return (
    <Layout title={title}>
      <div className="flex items-center justify-between border-b py-6 dark:border-stone-500 dark:border-opacity-20">
        <div className="space-y-0.5 ">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <div className="text-stone-500 dark:text-stone-400">
            {description}
          </div>
        </div>
        {rightSidebar && <div>{rightSidebar}</div>}
      </div>
      <div className="flex flex-col space-y-8 py-5 lg:flex-row lg:space-x-12 lg:space-y-0">
        {children}
      </div>
    </Layout>
  );
}
