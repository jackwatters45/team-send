import Groups from "@/components/group/Groups";
import { LoadingPage } from "@/components/ui/loading";
import { getServerAuthSession } from "@/server/auth";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";
import { api } from "@/utils/api";
import type { GetServerSidePropsContext } from "next";

export default function Dashboard() {
	api.group.getAll.useQuery();

	return <Groups />;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const session = await getServerAuthSession(context);
	if (!session) {
		return { redirect: { destination: "/login", permanent: false } };
	}

	const helpers = genSSRHelpers(session);
	await helpers.user.getCurrentUser.prefetch();

	return {
		props: {
			trpcState: helpers.dehydrate(),
		},
	};
}
