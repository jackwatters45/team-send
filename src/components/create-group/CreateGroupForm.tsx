"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { PlusCircledIcon, MinusCircledIcon } from "@radix-ui/react-icons";

import { Form, FormItem } from "../ui/form";
import { FormInput } from "../ui/form-inputs";
import { toast } from "../ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";

import { api } from "@/utils/api";
import type { IUser } from "@/server/api/routers/user";
import type { IGroupPreview } from "@/server/api/routers/group";
import extractInitials from "@/lib/extractInitials";

const formSchema = z.object({
  name: z.string().max(40),
  description: z.string().max(100).optional(),
  avatar: z.string().optional(),
  users: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().max(40),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      notes: z.string().max(100).optional(),
    }),
  ),
  recentsSearch: z.string().optional(),
});

function useCreateGroupForm() {
  const csvRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "Blue Ballers",
      description: "",
      avatar: "",
      users: [
        {
          name: "",
          email: "",
          phone: "",
          notes: "",
        },
      ],
      recentsSearch: "",
    },
  });

  const recentUsers = api.user.getLatest.useQuery(form.watch("recentsSearch"));
  const [usersAdded, setUsersAdded] = useState<IUser[]>([]);

  const recentGroups = api.group.getLatest.useQuery(
    form.watch("recentsSearch"),
  );
  const [groupsAdded, setGroupsAdded] = useState<IGroupPreview[]>([]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  };

  const handleAddUser = () => {
    form.setValue("users", [
      ...form.getValues("users"),
      {
        name: "",
        email: "",
        phone: "",
        notes: "",
      },
    ]);
  };

  const handleRemoveUser = (index: number) => {
    form.setValue(
      "users",
      form.getValues("users").filter((_, i) => i !== index),
    );
  };

  const handleClickContact = (user: IUser) => {
    setUsersAdded((prev) => [...prev, user]);
    form.setValue("users", [
      ...form.getValues("users"),
      {
        name: user.name,
        email: user.email,
        phone: user.phone,
        notes: user.notes,
      },
    ]);
  };

  const handleClickGroup = (group: IGroupPreview) => {
    setGroupsAdded((prev) => [...prev, group]);

    const filteredRecipients = group.recipients.filter((recipient) => {
      return !usersAdded.some(
        (existingUser) => existingUser.id === recipient.id,
      );
    });

    setUsersAdded((prev) => [...prev, ...filteredRecipients]);
    form.setValue("users", [
      ...form.getValues("users"),
      ...filteredRecipients.map((user) => ({
        name: user.name,
        email: user.email,
        phone: user.phone,
        notes: user.notes,
      })),
    ]);
  };

  const [parent] = useAutoAnimate();

  return {
    recentGroups,
    recentUsers,
    form,
    onSubmit,
    csvRef,
    handleAddUser,
    handleRemoveUser,
    handleClickContact,
    handleClickGroup,
    parent,
    usersAdded,
    groupsAdded,
  };
}

export default function CreateGroupForm() {
  const {
    form,
    onSubmit,
    csvRef,
    handleAddUser,
    handleRemoveUser,
    parent,
    handleClickContact,
    handleClickGroup,
    recentGroups,
    recentUsers,
    usersAdded,
    groupsAdded,
  } = useCreateGroupForm();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <section className="flex flex-col-reverse items-center lg:flex-row lg:justify-between lg:gap-12">
          <div className="flex w-full  flex-col gap-8 px-4 py-4  sm:px-0 lg:max-w-lg">
            <FormInput<typeof formSchema>
              control={form.control}
              name="avatar"
              label="Group Avatar"
              type="file"
              className="dark:file:text-white"
            />
            <FormInput<typeof formSchema>
              control={form.control}
              name="name"
              label="Name"
              placeholder="Enter a Group Name"
            />
            <FormInput<typeof formSchema>
              control={form.control}
              name="description"
              label="Description"
              placeholder="Enter a Group Description (optional)"
            />
          </div>
          {(form.watch("name") || form.watch("avatar")) && (
            <Avatar className="h-24 w-24 lg:h-48 lg:w-48">
              <AvatarImage src={form.watch("avatar")} alt="Group Avatar" />
              <AvatarFallback className="text-4xl font-medium lg:text-8xl">
                {extractInitials(form.watch("name"))}
              </AvatarFallback>
            </Avatar>
          )}
        </section>
        <section className="flex flex-col gap-3 pt-20">
          <div className="flex items-end justify-between border-b pb-1  text-xl font-semibold dark:border-stone-500 dark:border-opacity-20">
            <span>Add Members</span>
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
          <div className="pt-2">
            <div className="flex flex-col gap-2 py-2" ref={parent}>
              {form.watch("users")?.map((user, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex flex-1 flex-wrap items-start gap-2">
                    <FormInput<typeof formSchema>
                      control={form.control}
                      name={`users.${index}.name`}
                      placeholder="Name"
                    />
                    <FormInput<typeof formSchema>
                      control={form.control}
                      name={`users.${index}.email`}
                      type="email"
                      required={false}
                      placeholder="Email"
                    />
                    <FormInput<typeof formSchema>
                      control={form.control}
                      name={`users.${index}.phone`}
                      type="tel"
                      placeholder="Phone"
                    />
                    <div className="lg:flex-1">
                      <FormInput<typeof formSchema>
                        control={form.control}
                        name={`users.${index}.notes`}
                        placeholder="Notes"
                      />
                    </div>
                  </div>
                  <FormItem>
                    <Button
                      variant="ghost"
                      type="button"
                      className="border dark:border-stone-800 dark:hover:bg-stone-200"
                      onClick={() => handleRemoveUser(index)}
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
                onClick={handleAddUser}
              >
                <PlusCircledIcon className="h-5 w-5" />
                Add New
              </Button>
            </div>
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
                <FormInput<typeof formSchema>
                  control={form.control}
                  name={`recentsSearch`}
                  placeholder="Search for recent contacts or groups"
                />
              </div>
              <div className="flex flex-col pt-2">
                <TabsContent value="contacts">
                  <div className="flex flex-wrap">
                    {recentUsers.data
                      ?.filter(
                        (user) => !usersAdded.some((u) => u.id === user.id),
                      )
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
                      ?.filter(
                        (group) => !groupsAdded.some((g) => g.id === group.id),
                      )
                      .map((group) => (
                        <Button
                          key={group.id}
                          onClick={() => handleClickGroup(group)}
                          type="button"
                          variant={"ghost"}
                          className="flex h-fit w-full items-center justify-start gap-2 p-2 lg:w-1/2 dark:hover:bg-stone-800 dark:hover:bg-opacity-20"
                        >
                          <Avatar className="h-10 w-10">
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
          </div>
        </section>
      </form>
    </Form>
  );
}
