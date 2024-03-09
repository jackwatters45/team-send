import Layout from "./Layout";

interface GroupLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string | undefined;
}

export default function PageLayout({
  children,
  title,
  description,
}: GroupLayoutProps) {
  return (
    <Layout title={title}>
      <div className="space-y-0.5 border-b dark:border-stone-500 dark:border-opacity-20 py-6">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-stone-500 dark:text-stone-400">{description}</p>
      </div>
      <div className="flex flex-col space-y-8 py-5 lg:flex-row lg:space-x-12 lg:space-y-0">
        {children}
      </div>
    </Layout>
  );
}
