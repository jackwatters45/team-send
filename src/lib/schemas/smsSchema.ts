import { z } from "zod";

export const smsFormSchema = z.object({
  accountSid: z
    .string()
    .startsWith("AC", "Account SID should start with 'AC'")
    .min(34)
    .max(34),
  authToken: z.string().min(32).max(32),
  phoneNumber: z
    .string()
    .regex(/^\+1\d{10}$/, "Phone number should be in E.164 format")
    .min(12)
    .max(12),
});
export type SMSFormType = z.infer<typeof smsFormSchema>;
