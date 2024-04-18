import { useState } from "react";
import type { ClientUploadedFileData } from "uploadthing/types";
import type { Dispatch, SetStateAction } from "react";

import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast, toastWithLoading, useToast } from "@/components/ui/use-toast";
import { UploadButton } from "@/lib/uploadthing";
import { api } from "@/utils/api";

// TODO repeat with user avatar

type Files = ClientUploadedFileData<null>[];

function GroupAvatarUploadBase({
  groupId,
  handleUploadComplete,
}: {
  groupId?: string;
  handleUploadComplete?: (files: Files) => void;
}) {
  const { dismiss } = useToast();

  const [fileName, setFileName] = useState<string | undefined>(undefined);

  return (
    <FormItem>
      <FormLabel>Group Avatar</FormLabel>
      <UploadButton
        appearance={{
          allowedContent: "sr-only",
          button:
            "focus-within:ring-stone-800 dark:focus-within:ring-stone-200 ut-uploading:dark:after:bg-stone-200 ut-uploading:after:bg-stone-800 text-stone-900 dark:text-stone-200 flex h-10 w-full cursor-pointer select-none items-start justify-start rounded-md border border-stone-200 bg-white px-4 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-800 dark:bg-stone-900 dark:ring-offset-stone-950 dark:placeholder:text-stone-400 dark:focus-visible:ring-stone-300",
        }}
        content={{
          button: (
            <div className="flex items-center gap-3 py-2">
              <span className="font-medium">Choose File</span>
              <span>
                {fileName
                  ? fileName
                  : groupId
                    ? "No new file chosen"
                    : "No file chosen"}
              </span>
            </div>
          ),
        }}
        endpoint="groupAvatar"
        onClientUploadComplete={(files) => {
          dismiss();
          setFileName(files[0]?.name);
          if (handleUploadComplete) handleUploadComplete(files);
        }}
        onUploadError={(error: Error) => {
          toast({
            title: "Failed to upload group avatar",
            description: error.message ?? "An unknown error occurred.",
            variant: "destructive",
          });
        }}
        onUploadBegin={() => {
          toastWithLoading({
            title: "Uploading",
            description: "Uploading group avatar.",
          });
        }}
        input={{ groupId }}
      />
      <FormMessage id="image" />
    </FormItem>
  );
}

export function GroupAvatarUpload({ groupId }: { groupId: string }) {
  const ctx = api.useUtils();

  const handleUploadComplete = () =>
    void ctx.group.getGroupSettingsById.invalidate({ groupId });

  return (
    <GroupAvatarUploadBase
      groupId={groupId}
      handleUploadComplete={handleUploadComplete}
    />
  );
}

export function CreateGroupAvatarUpload({
  setImageURL,
}: {
  setImageURL: Dispatch<SetStateAction<string | undefined>>;
}) {
  const handleUploadComplete = (files: Files) => setImageURL(files?.[0]?.url);

  return <GroupAvatarUploadBase handleUploadComplete={handleUploadComplete} />;
}

export function UserAvatarUpload({
  handleUploadComplete,
}: {
  handleUploadComplete?: (files: Files) => void;
}) {
  const { dismiss } = useToast();

  const [fileName, setFileName] = useState<string | undefined>(undefined);

  return (
    <FormItem>
      <FormLabel>Avatar</FormLabel>
      <UploadButton
        appearance={{
          allowedContent: "sr-only",
          button:
            "focus-within:ring-stone-800 dark:focus-within:ring-stone-200 ut-uploading:dark:after:bg-stone-200 ut-uploading:after:bg-stone-800 text-stone-900 dark:text-stone-200 flex h-10 w-full cursor-pointer select-none items-start justify-start rounded-md border border-stone-200 bg-white px-4 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-800 dark:bg-stone-900 dark:ring-offset-stone-950 dark:placeholder:text-stone-400 dark:focus-visible:ring-stone-300",
        }}
        content={{
          button: (
            <div className="flex items-center gap-3 py-2">
              <span className="font-medium">Choose File</span>
              <span>{fileName ? fileName : "No file chosen"}</span>
            </div>
          ),
        }}
        endpoint="userAvatar"
        onClientUploadComplete={(files) => {
          dismiss();
          setFileName(files[0]?.name);
          if (handleUploadComplete) handleUploadComplete(files);
        }}
        onUploadError={(error: Error) => {
          toast({
            title: "Failed to upload user avatar",
            description: error.message ?? "An unknown error occurred.",
            variant: "destructive",
          });
        }}
        onUploadBegin={() => {
          toastWithLoading({
            title: "Uploading",
            description: "Uploading user avatar.",
          });
        }}
      />
      <FormMessage id="image" />
    </FormItem>
  );
}
