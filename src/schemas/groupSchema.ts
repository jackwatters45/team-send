import { z } from "zod";
import { memberSchema } from "./memberSchema";
import type { UseFormReturn } from "react-hook-form";

// connections
export const groupConnectionsSchema = z.object({
  useSMS: z.boolean(),
  "change-global-sms": z.boolean(),
  useEmail: z.boolean(),
  "change-global-email": z.boolean(),
  useGroupMe: z.boolean(),
  groupMeId: z
    .string()
    .regex(
      /^\d{8}$/,
      "GroupId must be exactly 8 digits long and consist only of numbers.",
    )
    .optional(),
});
export type GroupConnectionsFormType = z.infer<typeof groupConnectionsSchema>;
export type GroupConnectionsFormReturn =
  UseFormReturn<GroupConnectionsFormType>;

// basic info
export const groupBasicInfoSchema = z.object({
  groupId: z.string().optional(),
  name: z
    .string()
    .min(1, "Name is required and cannot be empty.")
    .max(40, "Name must not exceed 40 characters."),
  description: z
    .string()
    .max(100, "Description must not exceed 100 characters.")
    .optional(),
  image: z.string().url("Image must be a valid URL.").optional(),
  imageFile: z.string().optional(),
});
export type GroupBasicInfoFormType = z.infer<typeof groupBasicInfoSchema>;
export type GroupBasicInfoFormReturn = UseFormReturn<GroupBasicInfoFormType>;

// members
export const groupMembersFormSchema = z.object({
  members: z.array(memberSchema),
  addedGroupIds: z.array(z.string()),
});
export type GroupMembersFormType = z.infer<typeof groupMembersFormSchema>;
export type GroupMembersFormReturn = UseFormReturn<GroupMembersFormType>;

// create group
export const createGroupSchema = groupBasicInfoSchema
  .merge(groupConnectionsSchema)
  .merge(groupMembersFormSchema);
export type CreateGroupFormType = z.infer<typeof createGroupSchema>;

// settings
export const groupSettingsSchema = groupBasicInfoSchema.merge(
  groupConnectionsSchema,
);
export type GroupSettingsFormType = z.infer<typeof groupSettingsSchema>;
export type GroupSettingsFormReturn = UseFormReturn<GroupSettingsFormType>;
