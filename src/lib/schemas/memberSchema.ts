import { z } from "zod";

export const memberSchema = z.object({
  id: z.string().optional(),
  contact: z.object({
    name: z.string().min(1).max(40),
    email: z
      .string()
      .or(
        z
          .string()
          .email()
          .refine((val) => val !== "", "Invalid email"),
      )
      .optional()
      .nullable(),
    phone: z.string().optional().nullable(),
    notes: z.string().max(100).optional().nullable(),
    id: z.string().optional(),
  }),
  memberNotes: z.string().max(100).optional().nullable(),
  isRecipient: z.boolean(),
});
