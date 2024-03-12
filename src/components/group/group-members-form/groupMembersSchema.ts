import { z } from "zod";

const memberSchema = z.object({
  name: z.string().max(40),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  notes: z.string().max(100).optional(),
});

export const groupMembersFormSchema = z.object({
  name: z.string().max(40),
  description: z.string().max(100).optional(),
  avatar: z.string().optional(),
  members: z.array(memberSchema),
  recentsSearch: z.string().optional(),
});

export type GroupMembersFormType = z.infer<typeof groupMembersFormSchema>;

export type GroupMembersFormSchema = typeof groupMembersFormSchema;
