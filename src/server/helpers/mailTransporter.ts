import { env } from "@/env";
import nodemailer from "nodemailer";

export const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "oauth2",
    clientId: env.GOOGLE_ID_DEV,
    clientSecret: env.GOOGLE_SECRET_DEV,
  },
});
