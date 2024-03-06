import { Button } from "@/components/ui/button";

export default function GroupsTablePlaceholder() {
  return (
    <div className="flex justify-between">
      <div>
        <h2 className="text-2xl">No Groups Yet</h2>
        <p className="text-sm text-stone-800 opacity-75 dark:text-stone-100 ">
          To begin sending messages, create a group.
        </p>
      </div>
      <Button>Create Group</Button>
    </div>
  );
}
