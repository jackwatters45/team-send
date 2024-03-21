import type { GetStaticPropsContext, InferGetStaticPropsType } from "next";

import { api } from "@/utils/api";
import { generateServerSideHelpers } from "@/server/helpers/generateServerSideHelpers";
import { getHistoryTableColumns } from "@/components/group/group-history/historyTableColumns";

import { GroupLayout } from "@/layouts/GroupLayout";
import useDataTable from "@/hooks/useDataTable";
import {
  DataTableColumnOptions,
  DataTableContent,
  DataTableFilter,
  DataTablePagination,
  DataTableSelectedRowCount,
} from "@/components/ui/data-table";

export default function GroupHistory({ groupId }: GroupProps) {
  const { data } = api.group.getGroupById.useQuery({ groupId });

  const historyTableColumns = getHistoryTableColumns(groupId);
  const { table } = useDataTable({
    columns: historyTableColumns,
    data: data?.messages ?? [],
  });

  if (!data) {
    return <div>404</div>;
  }

  return (
    <GroupLayout group={data}>
      <div className="flex flex-col pb-4 pt-3">
        <h2 className="text-xl font-semibold tracking-tight">Group History</h2>
        <div className="text-sm text-stone-500 dark:text-stone-400">
          View message and user history for this group.
        </div>
      </div>

      <div>
        <div className="flex items-center py-4">
          <DataTableFilter
            table={table}
            placeholder="Search history"
            field="content"
          />
          <DataTableColumnOptions table={table} />
        </div>
        <div className="rounded-md border dark:border-stone-700">
          <DataTableContent table={table} columns={historyTableColumns} />
        </div>
        <div className="flex items-center justify-between p-2">
          <DataTableSelectedRowCount table={table} />
          <DataTablePagination table={table} />
        </div>
      </div>
    </GroupLayout>
  );
}

type GroupProps = InferGetStaticPropsType<typeof getStaticProps>;

export const getStaticProps = async (
  context: GetStaticPropsContext<{ groupId: string }>,
) => {
  const helpers = generateServerSideHelpers();

  const groupId = context.params?.groupId;

  if (typeof groupId !== "string") {
    throw new Error("Invalid slug");
  }

  await helpers.group.getGroupById.prefetch({ groupId });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      groupId,
    },
  };
};

export const getStaticPaths = () => ({
  paths: [],
  fallback: "blocking",
});
