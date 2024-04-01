import { z } from "zod";
import { groupMembersFormSchema } from "./groupMembersFormSchema";
import type { UseFormReturn } from "react-hook-form";

export const createGroupSchema = groupMembersFormSchema.extend({
  name: z.string().min(1).max(50),
  image: z.string().url().optional(),
  description: z.string().max(100).optional(),
});
export type CreateGroupFormType = z.infer<typeof createGroupSchema>;

export type CreateGroupFormReturn = UseFormReturn<CreateGroupFormType>;
