import { z } from "zod";

export const groupSettingsSchema = z.object({
  groupId: z.string(),
  name: z.string().max(40),
  description: z.string().max(100).optional(),
  image: z.string().optional(),
  "image-file": z.string().optional(),
  usePhone: z.boolean(),
  useEmail: z.boolean(),
  "change-global": z.boolean(),
});
export type GroupSettingsFormType = z.infer<typeof groupSettingsSchema>;
