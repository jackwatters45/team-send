import { z } from "zod";

 export const createGroupSchema = z.object({
  name: z.string().max(40),
  description: z.string().max(100).optional(),
  avatar: z.string().optional(),
  users: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().max(40),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      notes: z.string().max(100).optional(),
    }),
  ),
  recentsSearch: z.string().optional(),
});

export type ICreateGroupSchema = z.infer<typeof createGroupSchema>;

