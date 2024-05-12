import Groups from "@/components/group/Groups";
import { LoadingPage } from "@/components/ui/loading";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/utils/api";
import type { GetServerSidePropsContext } from "next";

export default function Dashboard() {
	const { isLoading } = api.group.getAll.useQuery();

	if (isLoading) return <LoadingPage />;

	return <Groups />;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const session = await getServerAuthSession(context);
	if (!session) {
		return { redirect: { destination: "/login", permanent: false } };
	}

	return {
		props: {},
	};
}
