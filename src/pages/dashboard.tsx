import Groups from "@/components/group/Groups";
import { LoadingPage } from "@/components/ui/loading";
import { getServerAuthSession } from "@/server/auth";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";
import { api } from "@/utils/api";
import type { GetServerSidePropsContext } from "next";
import { renderErrorComponent } from "@/components/error/renderErrorComponent";

export default function Dashboard() {
	const { data, error } = api.group.getAll.useQuery();

	if (!data) return renderErrorComponent(error);

	return <Groups groups={data} />;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const session = await getServerAuthSession(context);
	if (!session) {
		return { redirect: { destination: "/login", permanent: false } };
	}

	const helpers = genSSRHelpers(session);
	await helpers.group.getAll.prefetch();

	return {
		props: {
			trpcState: helpers.dehydrate(),
		},
	};
}
