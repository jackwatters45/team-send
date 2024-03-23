import { z } from "zod";

const memberSchema = z.object({
  contact: z.object({
    name: z.string().max(40),
    email: z.string().email().optional().nullable(),
    phone: z.string().optional().nullable(),
    notes: z.string().max(100).optional().nullable(),
    id: z.string().optional().nullable(),
  }),
  memberNotes: z.string().max(100).optional().nullable(),
  isRecipient: z.boolean(),
});

export const groupMembersFormSchema = z.object({
  name: z.string().max(40),
  description: z.string().max(100).optional(),
  avatar: z.string().optional(),
  members: z.array(memberSchema),
  addedGroupIds: z.array(z.string()),
});

export type GroupMembersFormType = z.infer<typeof groupMembersFormSchema>;

export type GroupMembersFormSchema = typeof groupMembersFormSchema;
