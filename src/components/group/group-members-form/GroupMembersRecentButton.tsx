import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import extractInitials from "@/lib/extractInitials";

type IRecentItemSharedProps<T> = {
  id: string;
  name: string;
  avatar?: string;
} & T;

interface IGroupMembersRecentButtonProps<T> {
  onClick: (item: IRecentItemSharedProps<T>) => void;
  item: IRecentItemSharedProps<T>;
  children: React.ReactNode;
}

export default function GroupMembersRecentButton<T>({
  onClick,
  item,
  children,
}: IGroupMembersRecentButtonProps<T>) {
  return (
    <Button
      key={item.id}
      onClick={() => onClick(item)}
      type="button"
      variant={"ghost"}
      className="flex h-fit w-full items-center justify-start gap-2 p-2 lg:w-1/2
dark:hover:bg-stone-800 dark:hover:bg-opacity-20"
    >
      <Avatar className="h-10 w-10">
        {item.avatar && <AvatarImage src={item.avatar} alt="Contact Avatar" />}
        <AvatarFallback className="">
          {extractInitials(item.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-start truncate">{children}</div>
    </Button>
  );
}
