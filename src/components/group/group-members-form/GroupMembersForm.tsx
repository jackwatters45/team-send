import { useForm, type UseFormReturn } from "react-hook-form";
import { useRef } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { MinusCircledIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { useDebounce } from "use-debounce";
import { parsePhoneNumber } from "libphonenumber-js";

import createContact from "@/lib/createContact";
import extractInitials from "@/lib/extractInitials";
import { api } from "@/utils/api";
import type { Contact, ContactBaseWithId } from "@/server/api/routers/contact";

import {
  type GroupMembersFormType,
  type GroupMembersFormSchema,
} from "@/components/group/group-members-form/groupMembersSchema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormInput } from "@/components/ui/form-inputs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

type FormReturn = UseFormReturn<GroupMembersFormType>;

interface GroupMembersFormProps extends GroupMemberHeaderProps {
  form: FormReturn;
  submitText: string;
}

export default function GroupMembersFormContent({
  form,
  title,
  submitText,
}: GroupMembersFormProps) {
  return (
    <>
      <GroupMemberHeader title={title} />
      <GroupMemberList form={form} />
      <GroupMembersRecents form={form} />
      <Button type="submit">{submitText}</Button>
    </>
  );
}

interface GroupMemberHeaderProps {
  title: string;
}
function GroupMemberHeader({ title }: GroupMemberHeaderProps) {
  const csvRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-end justify-between border-b pb-1  text-xl font-semibold dark:border-stone-500 dark:border-opacity-20">
      <span>{title}</span>
      <label htmlFor="csv-file-input" className="mb-1">
        <Button
          type="button"
          variant="secondary"
          size={"sm"}
          className="h-7"
          onClick={() => csvRef.current?.click()}
        >
          Upload CSV
        </Button>
        <input
          id="csv-file-input"
          type="file"
          className="hidden"
          accept=".csv"
          ref={csvRef}
        />
      </label>
    </div>
  );
}

function GroupMemberList({ form }: { form: FormReturn }) {
  const [parent] = useAutoAnimate();

  return (
    <div className="flex flex-col gap-2 py-2" ref={parent}>
      {form.watch("members")?.map((_, index) => (
        <div key={index} className="flex gap-2">
          <div className="flex flex-1 flex-wrap items-start gap-2">
            <FormField
              control={form.control}
              name={`members.${index}.isRecipient`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex h-10 cursor-pointer rounded-md border border-stone-200 bg-white px-3 py-2 text-sm dark:border-stone-800 dark:bg-stone-900">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormLabel>
                </FormItem>
              )}
            />
            <FormInput<GroupMembersFormSchema>
              control={form.control}
              name={`members.${index}.contact.name`}
              placeholder="Name"
            />
            <FormInput<GroupMembersFormSchema>
              control={form.control}
              name={`members.${index}.contact.email`}
              type="email"
              required={false}
              placeholder="Email"
            />
            <FormInput<GroupMembersFormSchema>
              control={form.control}
              name={`members.${index}.contact.phone`}
              type="tel"
              placeholder="Phone"
            />
            <div className="lg:flex-1">
              <FormInput<GroupMembersFormSchema>
                control={form.control}
                name={`members.${index}.memberNotes`}
                placeholder="Notes"
              />
            </div>
          </div>
          <FormItem>
            <Button
              variant="ghost"
              type="button"
              className="border hover:bg-stone-100
               dark:border-0 dark:hover:bg-stone-800"
              onClick={() => {
                form.setValue(
                  "members",
                  form.getValues("members").filter((_, i) => i !== index),
                );
              }}
            >
              <MinusCircledIcon className="h-5 w-5" />
            </Button>
          </FormItem>
        </div>
      ))}
      <Button
        type="button"
        size={"sm"}
        className="flex w-fit items-center gap-2 pl-2"
        onClick={() => {
          form.setValue("members", [
            ...form.getValues("members"),
            createContact(),
          ]);
        }}
      >
        <PlusCircledIcon className="h-5 w-5" />
        Add New
      </Button>
    </div>
  );
}

function GroupMembersRecents({ form }: { form: FormReturn }) {
  const recentSearch = useForm({ defaultValues: { recentsSearch: "" } });

  const [search] = useDebounce(recentSearch.watch("recentsSearch"), 500);

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
        <FormInput
          control={form.control}
          name={`recentsSearch`}
          placeholder="Search for recent contacts or groups"
        />
      </div>
      <div className="flex flex-col pt-2">
        <RecentGroupResults search={search} form={form} />
        <RecentContactsResults search={search} form={form} />
      </div>
    </Tabs>
  );
}

interface RecentResultsProps {
  search: string;
  form: FormReturn;
}

function RecentGroupResults({ search, form }: RecentResultsProps) {
  const { data } = api.group.getRecentGroups.useQuery({
    search,
    addedGroupIds: form.getValues("addedGroupIds"),
  });

  const handleClickGroup = (
    id: string,
    groupMembers: Array<{ contact: Contact }>,
  ) => {
    form.setValue("addedGroupIds", [...form.getValues("addedGroupIds"), id]);

    const members = form.getValues("members");
    const filteredGroupMemberIds = groupMembers.reduce(
      (accumulator, { contact }) => {
        if (!members.some((m) => m.contact.id === contact.id)) {
          accumulator.push({ isRecipient: true, contact, memberNotes: "" });
        }
        return accumulator;
      },
      [] as GroupMembersFormType["members"],
    );

    form.setValue("members", [...members, ...filteredGroupMemberIds]);
  };

  return (
    <TabsContent value="groups">
      <div className="flex flex-wrap">
        {data ? (
          data.map((group) => (
            <Button
              key={group?.id}
              onClick={() => handleClickGroup(group.id, group.members)}
              type="button"
              variant={"ghost"}
              className="flex h-fit w-full items-center justify-start gap-2 p-2 lg:w-1/2
      dark:hover:bg-stone-800 dark:hover:bg-opacity-20"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={group.image ?? undefined}
                  alt="Contact Avatar"
                />
                <AvatarFallback className="">
                  {extractInitials(group.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start truncate">
                <div>{group.name}</div>
                {group.description && (
                  <div className="text-sm text-stone-500">
                    {group.description.slice(0, 60)}
                  </div>
                )}
              </div>
            </Button>
          ))
        ) : (
          <div>No groups named &quot;{search}&quot;</div>
        )}
      </div>
    </TabsContent>
  );
}

function RecentContactsResults({ search, form }: RecentResultsProps) {
  const addedContactIds = form
    .getValues("members")
    .reduce((accumulator, member) => {
      if (member.contact.id) {
        accumulator.push(member.contact.id);
      }
      return accumulator;
    }, [] as string[]);

  const { data } = api.contact.getRecentContacts.useQuery({
    search,
    addedContactIds,
  });

  const handleClickContact = (contact: ContactBaseWithId) => {
    form.setValue("members", [
      ...form.getValues("members"),
      { isRecipient: true, contact, memberNotes: "" },
    ]);
  };

  return (
    <TabsContent value="contacts">
      <div className="flex flex-wrap">
        {data ? (
          data.map((contact) => {
            const phoneNumber = contact?.phone
              ? parsePhoneNumber(contact.phone)
              : null;
            return (
              <Button
                key={contact?.id}
                onClick={() => handleClickContact(contact)}
                type="button"
                variant={"ghost"}
                className="flex h-fit w-full items-center justify-start gap-2 p-2 lg:w-1/2 dark:hover:bg-stone-800 dark:hover:bg-opacity-20"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="">
                    {extractInitials(contact.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start truncate">
                  <div>{contact.name}</div>
                  <div className="flex text-sm text-stone-500 ">
                    {contact.email && <div>{contact.email}</div>}
                    {phoneNumber && contact.email && (
                      <div className="mx-1">•</div>
                    )}
                    {phoneNumber && <div>{phoneNumber.formatNational()}</div>}
                  </div>
                </div>
              </Button>
            );
          })
        ) : (
          <div>No contacts named &quot;{search}&quot;</div>
        )}
      </div>
    </TabsContent>
  );
}
