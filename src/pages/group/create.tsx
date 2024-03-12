import CreateGroupForm from "@/components/group/create-group/CreateGroupForm";
import PageLayout from "@/layouts/PageLayout";

export default function CreateGroup() {
  return (
    <PageLayout
      title={"Create New Group"}
      description={"Add members to your group and send them messages."}
    >
      <CreateGroupForm />
    </PageLayout>
  );
}
