import { z } from "zod";
import { memberSchema } from "./memberSchema";
import type { UseFormReturn } from "react-hook-form";

export const groupMembersFormSchema = z.object({
  groupId: z.string().optional(),
  members: z.array(memberSchema),
  addedGroupIds: z.array(z.string()),
});

export type GroupMembersFormType = z.infer<typeof groupMembersFormSchema>;

export type GroupMembersFormReturn = UseFormReturn<GroupMembersFormType>;
