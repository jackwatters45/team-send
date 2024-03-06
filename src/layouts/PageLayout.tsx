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
      <div className="space-y-0.5 border-b border-stone-400 border-opacity-10 py-6">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-stone-800 opacity-60 dark:text-stone-100">
          {description}
        </p>
      </div>
      <div className="flex flex-col space-y-8 py-5 lg:flex-row lg:space-x-12 lg:space-y-0">
        {children}
      </div>
    </Layout>
  );
}
