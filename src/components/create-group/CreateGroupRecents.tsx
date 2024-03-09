import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { FormInput } from "../ui/form-inputs";
import { Button } from "../ui/button";

import extractInitials from "@/lib/extractInitials";
import type { IUser } from "@/server/api/routers/user";
import type { IGroupPreview } from "@/server/api/routers/group";
import { api } from "@/utils/api";
import createUser from "@/lib/createUser";
import type { ICreateGroupSchema, createGroupSchema } from "./createGroupSchema";

interface ICreateGroupRecentsProps {
  form: UseFormReturn<ICreateGroupSchema>;
}
export default function CreateGroupRecents({ form }: ICreateGroupRecentsProps) {
  const search = form.watch("recentsSearch");
  const recentUsers = api.user.getLatest.useQuery(search);
  const recentGroups = api.group.getLatest.useQuery(search);

  const [usersAdded, setUsersAdded] = useState<IUser[]>([]);
  const handleClickContact = (user: IUser) => {
    setUsersAdded((prev) => [...prev, user]);
    form.setValue("users", [...form.getValues("users"), createUser(user)]);
  };

  const [groupsAdded, setGroupsAdded] = useState<IGroupPreview[]>([]);
  const handleClickGroup = (group: IGroupPreview) => {
    setGroupsAdded((prev) => [...prev, group]);

    const filteredMembers = group.members.filter((member) => {
      return !usersAdded.some(
        (existingUser) => existingUser.id === member.id,
      );
    });

    setUsersAdded((prev) => [...prev, ...filteredMembers]);
    form.setValue("users", [
      ...form.getValues("users"),
      ...filteredMembers.map((user) => createUser(user)),
    ]);
  };

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
        <FormInput<typeof createGroupSchema>
          control={form.control}
          name={`recentsSearch`}
          placeholder="Search for recent contacts or groups"
        />
      </div>
      <div className="flex flex-col pt-2">
        <TabsContent value="contacts">
          <div className="flex flex-wrap">
            {recentUsers.data
              ?.filter((user) => !usersAdded.some((u) => u.id === user.id))
              .map((user) => (
                <Button
                  key={user.id}
                  onClick={() => handleClickContact(user)}
                  type="button"
                  variant={"ghost"}
                  className="flex h-fit w-full items-center justify-start gap-2 p-2 lg:w-1/2
                dark:hover:bg-stone-800 dark:hover:bg-opacity-20"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="">
                      {extractInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start truncate">
                    <div>{user.name}</div>
                    <div className="flex text-sm text-stone-500 ">
                      {user.email && <div>{user.email}</div>}
                      {user.phone && user.email && (
                        <div className="mx-1">•</div>
                      )}
                      {user.phone && <div>{user.phone}</div>}
                    </div>
                  </div>
                </Button>
              ))}
          </div>
        </TabsContent>
        <TabsContent value="groups">
          <div className="flex flex-wrap">
            {recentGroups.data
              ?.filter((group) => !groupsAdded.some((g) => g.id === group.id))
              .map((group) => (
                <Button
                  key={group.id}
                  onClick={() => handleClickGroup(group)}
                  type="button"
                  variant={"ghost"}
                  className="flex h-fit w-full items-center justify-start gap-2 p-2 lg:w-1/2 dark:hover:bg-stone-800 dark:hover:bg-opacity-20"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={group.avatar} alt="Group Avatar" />
                    <AvatarFallback className="">
                      {extractInitials(group.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex w-full flex-col items-start truncate">
                    <div>{group.name}</div>
                    {group.description && (
                      <div className="text-sm text-stone-500">
                        {group.description.slice(0, 60)}
                      </div>
                    )}
                  </div>
                </Button>
              ))}
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
