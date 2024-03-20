import type { UseFormReturn } from "react-hook-form";
import { useDebounce } from "use-debounce";

import type { Contact } from "@/server/api/routers/contact";
import type { IGroupPreview } from "@/server/api/routers/group";
import { api } from "@/utils/api";
import type { GroupMembersFormType } from "./groupMembersSchema";

interface IUseGroupMembersRecentsProps {
  form: UseFormReturn<GroupMembersFormType>;
}

export default function useGroupMembersRecents({
  form,
}: IUseGroupMembersRecentsProps) {
  const [search] = useDebounce(form.watch("recentsSearch"), 500);

  // const recentContactsQuery =
  // await api.contact.getRecentContacts.useQuery(search);
  // const contactsResults = recentContactsQuery.data ?? [];

  // const recentGroupsQuery = await api.group.getRecentGroups.useQuery(search);
  // const groupsResults = recentGroupsQuery.data ?? [];

  const handleClickContact = (contact: Contact) => {
    // query that adds contact to group + addedContacts
  };

  const handleClickGroup = (group: IGroupPreview) => {
    // query that adds group users to group + addedContacts
  };

  return {
    contactsResults: [],
    groupsResults: [],
    handleClickContact,
    handleClickGroup,
  };
}
