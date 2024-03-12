import { type UseFormReturn } from "react-hook-form";

import { type GroupMembersFormType } from "../groupMembersSchema";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import extractInitials from "@/lib/extractInitials";
import { type IGroupPreview } from "@/server/api/routers/group";

interface IRecentGroupResultsProps {
  groupsResults: IGroupPreview[];
  form: UseFormReturn<GroupMembersFormType>;
  handleClickGroup: (item: IGroupPreview) => void;
}

export default function RecentGroupResults({
  groupsResults,
  form,
  handleClickGroup,
}: IRecentGroupResultsProps) {
  return (
    <TabsContent value="groups">
      <div className="flex flex-wrap">
        {groupsResults ? (
          groupsResults.map((group) => (
            <Button
              key={group.id}
              onClick={() => handleClickGroup(group)}
              type="button"
              variant={"ghost"}
              className="flex h-fit w-full items-center justify-start gap-2 p-2 lg:w-1/2
      dark:hover:bg-stone-800 dark:hover:bg-opacity-20"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={group.avatar} alt="Contact Avatar" />
                <AvatarFallback className="">
                  {extractInitials(group.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start truncate">
                <div>{group.name}</div>
                {group.description && (
                  <div className="text-sm text-stone-500">
                    {group.description.slice(0, 60)}
                  </div>
                )}
              </div>
            </Button>
          ))
        ) : (
          <div>No groups named &quot;{form.watch("recentsSearch")}&quot;</div>
        )}
      </div>
    </TabsContent>
  );
}
