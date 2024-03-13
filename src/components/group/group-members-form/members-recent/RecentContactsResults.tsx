import { parsePhoneNumber } from "libphonenumber-js";
import { type UseFormReturn } from "react-hook-form";

import { type IContact } from "@/server/api/routers/contact";
import { type GroupMembersFormType } from "../groupMembersSchema";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import extractInitials from "@/lib/extractInitials";

interface IRecentContactsResultsProps {
  contactsResults: IContact[];
  form: UseFormReturn<GroupMembersFormType>;
  handleClickContact: (item: IContact) => void;
}

export default function RecentContactsResults({
  contactsResults,
  form,
  handleClickContact,
}: IRecentContactsResultsProps) {
  return (
    <TabsContent value="groups">
      <div className="flex flex-wrap">
        {contactsResults ? (
          contactsResults.map((contact) => {
            const phoneNumber = contact.phone
              ? parsePhoneNumber(contact.phone)
              : null;
            return (
              <Button
                key={contact.id}
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
          <div>No contacts named &quot;{form.watch("recentsSearch")}&quot;</div>
        )}
      </div>
    </TabsContent>
  );
}
