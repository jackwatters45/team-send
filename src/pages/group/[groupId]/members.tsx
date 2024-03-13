import { type GetServerSidePropsContext } from "next";

import { GroupLayout } from "@/layouts/GroupLayout";
import GroupMembersForm from "@/components/group/group-members-form/GroupMembersForm";
import { api } from "@/utils/api";

// export async function getServerSideProps(context: GetServerSidePropsContext) {
//   const search = context.query.search ?? "";

//   const [contactsResults, groupsResults] = await Promise.all([
//     api.contact.getRecentContacts(search),
//     api.group.getRecentGroups(search),
//   ]);

//   return {
//     props: {
//       contactsResults,
//       groupsResults,
//     },
//   };
// }

export default function GroupMembers() {
  const group = api.group.getGroupData.useQuery();

  if (!group.data) {
    return null;
  }

  return (
    <GroupLayout group={group.data}>
      <GroupMembersForm group={group.data} />
    </GroupLayout>
  );
}
