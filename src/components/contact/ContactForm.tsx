import { useForm } from "react-hook-form";

import { type IContact } from "@/server/api/routers/contact";

import { Form } from "../ui/form";
import { FormInput, FormTextarea } from "../ui/form-inputs";
import { Button } from "../ui/button";

interface IContactFormProps {
  contact: IContact;
}

export default function ContactForm({ contact }: IContactFormProps) {
  const form = useForm<IContact>({
    defaultValues: contact,
  });

  const onSubmit = (data: IContact) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-8"
      >
        <h2 className="text-lg font-semibold">Edit Details</h2>
        <FormInput
          label="Name"
          name="name"
          placeholder="Name"
          control={form.control}
        />
        <FormInput
          label="Email"
          name="email"
          placeholder="Email"
          type="email"
          control={form.control}
        />
        <FormInput
          label="Phone"
          name="phone"
          placeholder="Phone"
          type="tel"
          control={form.control}
        />
        <FormTextarea
          label="Notes"
          name="notes"
          placeholder="Notes"
          control={form.control}
        />
        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  );
}
