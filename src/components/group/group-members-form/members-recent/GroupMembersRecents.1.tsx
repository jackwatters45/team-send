import { type UseFormReturn } from "react-hook-form";

import { Tabs, TabsList, TabsTrigger } from "../../../ui/tabs";
import { FormInput } from "../../../ui/form-inputs";
import type {
  GroupMembersFormType,
  GroupMembersFormSchema,
} from "../groupMembersSchema";
import useGroupMembersRecents from "../useGroupMembersRecents";
import RecentContactsResults from "./RecentContactsResults";
import RecentGroupResults from "./RecentGroupResults";

interface IGroupMembersRecentsProps {
  form: UseFormReturn<GroupMembersFormType>;
}

export default function GroupMembersRecents({
  form,
}: IGroupMembersRecentsProps) {
  const {
    contactsResults,
    groupsResults,
    handleClickContact,
    handleClickGroup,
  } = useGroupMembersRecents({ form });

  return (
    <Tabs
      defaultValue="contacts"
      className="border-t py-2 dark:border-stone-500 dark:border-opacity-20"
    >
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold">Recents</span>
        <TabsList className="grid w-full max-w-[300px] grid-cols-2">
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
        </TabsList>
      </div>
      <div className="pt-4">
        <FormInput<GroupMembersFormSchema>
          control={form.control}
          name={`recentsSearch`}
          placeholder="Search for recent contacts or groups"
        />
      </div>
      <div className="flex flex-col pt-2">
        <RecentContactsResults
          contactsResults={contactsResults}
          form={form}
          handleClickContact={handleClickContact}
        />
        <RecentGroupResults
          groupsResults={groupsResults}
          form={form}
          handleClickGroup={handleClickGroup}
        />
      </div>
    </Tabs>
  );
}
