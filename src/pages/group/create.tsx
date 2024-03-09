import CreateGroupForm from "@/components/create-group/CreateGroupForm";
import PageLayout from "@/layouts/PageLayout";

export default function CreateGroup() {
  return (
    <PageLayout
      title={"Create New Group"}
      description={"Add recipients to your group and send them messages."}
    >

<CreateGroupForm />
    </PageLayout>
  );
}