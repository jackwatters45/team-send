import * as z from "zod";

export const groupSettingsSchema = z.object({
  name: z.string().max(40),
  description: z.string().max(100).optional(),
  avatar: z.string().optional(),
  "avatar-file": z.string().optional(),
  phone: z.boolean(),
  email: z.boolean(),
  "change-global": z.boolean(),
});

export type GroupSettingsFormType = z.infer<typeof groupSettingsSchema>;

export type GroupSettingsFormSchema = typeof groupSettingsSchema;
