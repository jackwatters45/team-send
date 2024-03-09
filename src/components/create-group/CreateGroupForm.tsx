"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "../ui/form";
import { FormInput } from "../ui/form-inputs";
import { toast } from "../ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import extractInitials from "@/lib/extractInitials";
import { Button } from "../ui/button";
import { useRef } from "react";

const formSchema = z.object({
  name: z.string().max(40),
  description: z.string().max(100).optional(),
  avatar: z.string().optional(),
});

function useCreateGroupForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "Blue Ballers",
      description: "",
      avatar: "",
    },
  });

  const csvRef = useRef<HTMLInputElement>(null);

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

  return { form, onSubmit, csvRef };
}

export default function CreateGroupForm() {
  const { form, onSubmit, csvRef } = useCreateGroupForm();

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
          <div className="flex items-end justify-between border-b text-xl  font-semibold dark:border-stone-500 dark:border-opacity-20 ">
            <span>Add Members</span>
            <label htmlFor="csv-file-input" className="mb-1 ">
              <Button
                type="button"
                variant="secondary"
                size={"sm"}
                className="h-7"
                onClick={() => csvRef.current?.click()}
              >
                +Upload CSV
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
          <FormInput<typeof formSchema>
            control={form.control}
            name="description"
            placeholder="Enter a Group Description (optional)"
          />
          <Tabs defaultValue="contacts" className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-lg">Recents</span>
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
