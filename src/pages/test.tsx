import Layout from "@/layouts/Layout";

export default function Test() {
  return (
    <Layout>
      <h1>Test</h1>
      {/* <Button onClick={handleClick}>Test</Button> */}
    </Layout>
  );
}

const isVisible = false;

export const getServerSideProps = async () => {
  if (!isVisible) {
    return {
      redirect: { destination: "/", permanent: false },
    };
  }

  return {
    props: {},
  };
};
