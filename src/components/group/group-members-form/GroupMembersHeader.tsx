import { useRef } from "react";

import { Button } from "../../ui/button";

interface IGroupMembersHeaderProps {
  title: string;
}
export default function GroupMembersHeader({
  title,
}: IGroupMembersHeaderProps) {
  const csvRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-end justify-between border-b pb-1  text-xl font-semibold dark:border-stone-500 dark:border-opacity-20">
      <span>{title}</span>
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
  );
}
