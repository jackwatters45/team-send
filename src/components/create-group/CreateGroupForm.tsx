"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";

import { Form, FormItem } from "../ui/form";
import { FormInput } from "../ui/form-inputs";
import { toast } from "../ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import extractInitials from "@/lib/extractInitials";
import { PlusCircledIcon, MinusCircledIcon } from "@radix-ui/react-icons";

const formSchema = z.object({
  name: z.string().max(40),
  description: z.string().max(100).optional(),
  avatar: z.string().optional(),
  users: z.array(
    z.object({
      name: z.string().max(40),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      notes: z.string().max(100).optional(),
    }),
  ),
});

interface IUser {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

function useCreateGroupForm() {
  const csvRef = useRef<HTMLInputElement>(null);

  // const [users, setUsers] = useState<IUser[]>([]);

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
    },
  });

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

  return { form, onSubmit, csvRef, handleAddUser, handleRemoveUser };
}

export default function CreateGroupForm() {
  const { form, onSubmit, csvRef, handleAddUser, handleRemoveUser } =
    useCreateGroupForm();

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
          <div className="flex flex-col gap-2 py-2">
            {form.watch("users")?.map((user, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  <FormInput<typeof formSchema>
                    control={form.control}
                    name={`users.${index}.name`}
                    placeholder="Name"
                  />
                  <FormInput<typeof formSchema>
                    control={form.control}
                    name={`users.${index}.email`}
                    type="email"
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
                    className="border border-stone-800 hover:bg-stone-200"
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
            <TabsContent value="contacts">
              <div>in your other groups</div>

              {/* <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Make changes to your account here. Click save when you're done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="Pedro Duarte" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue="@peduarte" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save changes</Button>
          </CardFooter>
        </Card> */}
            </TabsContent>
            <TabsContent value="groups">
              <div>other groups (copy whole thing)</div>

              {/* <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here. After saving, you'll be logged out.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" type="password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save password</Button>
          </CardFooter>
        </Card> */}
            </TabsContent>
          </Tabs>
        </section>
      </form>
    </Form>
  );
}
