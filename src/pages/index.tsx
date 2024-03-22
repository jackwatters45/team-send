import Layout from "@/layouts/Layout";
import { api } from "@/utils/api";
import useDataTable from "@/hooks/useDataTable";
import { groupsColumns } from "@/components/group/groups-table/groupsColumns";
import {
  DataTableColumnOptions,
  DataTableContent,
  DataTableFilter,
  DataTablePagination,
  DataTableSelectedRowCount,
} from "@/components/ui/data-table";
import { genSSRHelpers } from "@/server/helpers/genSSRHelpers";

export default function Home() {
  const { data } = api.group.getAll.useQuery();

  const { table } = useDataTable({
    columns: groupsColumns,
    data: data ?? [],
  });

  if (!data) {
    return null;
  }

  return (
    <Layout>
      <h2 className="text-2xl">Your Groups</h2>
      <div>
        <div className="flex items-center py-4">
          <DataTableFilter table={table} placeholder="Search groups" />
          <DataTableColumnOptions table={table} />
        </div>
        <div className="rounded-md border dark:border-stone-700">
          <DataTableContent
            table={table}
            columns={groupsColumns}
            // link={{ pre: "/group/", field: "id" }} TODO
          />
        </div>
        <div className="flex items-center justify-between p-2">
          <DataTableSelectedRowCount table={table} />
          <DataTablePagination table={table} />
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps = async () => {
  const helpers = genSSRHelpers();

  await helpers.group.getAll.prefetch();

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
};
