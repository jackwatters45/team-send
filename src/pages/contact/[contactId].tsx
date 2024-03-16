import { useRouter } from "next/router";

import { api } from "@/utils/api";

import PageLayout from "@/layouts/PageLayout";
import ContactForm from "@/components/contact/ContactForm";
import ContactGroupCards from "@/components/contact/ContactGroupCards";

export default function Contact() {
  const contactId = useRouter().query.contactId as string;
  const contact = api.contact.getContactData.useQuery(contactId)?.data;

  // obviously this is not the right way to do this
  const contactGroups = api.group.getRecentGroups.useQuery()?.data;

  return contact ? (
    <PageLayout title={contact?.name} description={`User ID: ${contactId}`}>
      <ContactForm contact={contact} />
      <div className="border-b lg:hidden dark:border-stone-500 dark:border-opacity-20" />
      {contactGroups && contactGroups?.length > 0 ? (
        <div className="lg:w-1/3">
          <ContactGroupCards contactGroups={contactGroups} />
        </div>
      ) : null}
    </PageLayout>
  ) : null;
}
