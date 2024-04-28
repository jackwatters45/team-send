/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

const formSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
});

export type MailingFormSchema = z.infer<typeof formSchema>;

export default function MailingForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  async function onSubmit(values: MailingFormSchema) {
    try {
      const response = await fetch("/api/mailing-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast({
          description: "You have successfully subscribed to our mailing list!",
        });
        form.reset();
      } else {
        toast({
          description: "An error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="container flex w-full flex-col items-center justify-center border-none bg-transparent px-4 py-12 shadow-none md:px-6 md:py-24 lg:py-32 dark:bg-transparent">
      <CardHeader className="space-y-4 text-center">
        <CardTitle className="text-3xl font-bold tracking-tighter sm:text-5xl">
          Keep up with the Latest Updates
        </CardTitle>
        <CardDescription className="dark:text-stone max-w-[700px] text-stone-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          Stay up-to-date with the latest news, releases, and features.
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full max-w-screen-md px-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full flex-col items-end gap-4 space-x-2 sm:flex-row "
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full flex-1 space-y-2">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your name"
                      className="dark:bg-transparent "
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-full flex-1 space-y-2">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      className="dark:bg-transparent"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="w-full pt-4 sm:w-fit sm:pt-0">
              <Button className="w-full sm:w-fit " type="submit">
                Subscribe
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
