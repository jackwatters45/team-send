import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useDebounce } from "use-debounce";
import type { IContact } from "@/server/api/routers/contact";
import type { IGroupPreview } from "@/server/api/routers/group";
import { api } from "@/utils/api";
import createContact from "@/lib/createContact";
import type { GroupMembersFormType } from "./groupMembersSchema";

interface IUseGroupMembersRecentsProps {
  form: UseFormReturn<GroupMembersFormType>;
}

export default function useGroupMembersRecents({
  form,
}: IUseGroupMembersRecentsProps) {
  const [search] = useDebounce(form.watch("recentsSearch"), 500);
  const recentContacts = api.contact.getLatest.useQuery(search);
  const recentGroups = api.group.getLatest.useQuery(search);

  const [contactsAdded, setContactsAdded] = useState<IContact[]>([]);
  const [prevContactsResults, setPrevContactsResults] = useState<IContact[]>(
    [],
  );

  const contactsResults = recentContacts.isLoading
    ? prevContactsResults
    : recentContacts.data?.filter(
        (contact) => !contactsAdded.some((u) => u.id === contact.id),
      ) ?? [];

  useEffect(() => {
    if (recentContacts.isSuccess) {
      setPrevContactsResults(
        recentContacts.data?.filter(
          (contact) => !contactsAdded.some((u) => u.id === contact.id),
        ) ?? [],
      );
    }
  }, [recentContacts.isSuccess, recentContacts.data, contactsAdded]);

  const [groupsAdded, setGroupsAdded] = useState<IGroupPreview[]>([]);
  const [previousGroupsResults, setPreviousGroupsResults] = useState<
    IGroupPreview[]
  >([]);
  const groupsResults = recentGroups.isLoading
    ? previousGroupsResults
    : recentGroups.data?.filter(
        (group) => !groupsAdded.some((g) => g.id === group.id),
      ) ?? [];

  useEffect(() => {
    if (recentGroups.isSuccess) {
      setPreviousGroupsResults(
        recentGroups.data?.filter(
          (group) => !groupsAdded.some((g) => g.id === group.id),
        ) ?? [],
      );
    }
  }, [recentGroups.isSuccess, recentGroups.data, groupsAdded]);

  const handleClickContact = (contact: IContact) => {
    setContactsAdded((prev) => [...prev, contact]);
    form.setValue("members", [
      ...form.getValues("members"),
      createContact(contact),
    ]);
  };

  const handleClickGroup = (group: IGroupPreview) => {
    setGroupsAdded((prev) => [...prev, group]);

    const filteredContacts = group.members.filter((member) => {
      return !contactsAdded.some(
        (existingContact) => existingContact.id === member.id,
      );
    });

    setContactsAdded((prev) => [...prev, ...filteredContacts]);
    form.setValue("members", [
      ...form.getValues("members"),
      ...filteredContacts.map((contact) => createContact(contact)),
    ]);
  };

  return {
    contactsResults,
    groupsResults,
    handleClickContact,
    handleClickGroup,
  };
}
