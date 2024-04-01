import { z } from "zod";

export const userSettingsFormSchema = z.object({
  name: z.string().max(40).min(1),
  image: z.string().optional(),
  imageFile: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  username: z.string().optional(),
});

export type UserSettingsFormType = z.infer<typeof userSettingsFormSchema>;

export const userSettingsSchema = z.object({
  name: z.string().max(40).min(1),
  image: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  username: z.string().optional(),
});
