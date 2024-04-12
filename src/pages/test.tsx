import Layout from "@/layouts/Layout";
import { Button } from "@/components/ui/button";
import { toastWithLoading } from "@/components/ui/use-toast";

// import { api } from "@/utils/api";

export default function Test() {
  const handleClick = async () => {
    toastWithLoading({
      title: "title",
      description: "description",
    });
  };

  return (
    <Layout>
      <Button onClick={handleClick}>Test</Button>
    </Layout>
  );
}
