import { z } from "zod";

export const groupSettingsSchema = z.object({
  groupId: z.string(),
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
  useSMS: z.boolean(),
  useEmail: z.boolean(),
  groupMeId: z
    .string()
    .regex(
      /^\d{8}$/,
      "GroupId must be exactly 8 digits long and consist only of numbers.",
    )
    .optional(),
  useGroupMe: z.boolean(),
  "change-global-sms": z.boolean(),
  "change-global-email": z.boolean(),
});
export type GroupSettingsFormType = z.infer<typeof groupSettingsSchema>;
