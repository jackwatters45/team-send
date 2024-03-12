"use client";

import Layout from "@/layouts/Layout";
import GroupsTable from "@/components/group/groups-table/GroupsTable";

export default function Home() {
  return (
    <Layout>
      <GroupsTable />
    </Layout>
  );
}
