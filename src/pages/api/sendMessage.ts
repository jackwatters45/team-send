// pages/api/sendMessage.ts
import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import TwilioClient from "twilio";
import { TRPCError } from "@trpc/server";
import { Redis } from "@upstash/redis";
import debug from "debug";
import { verifySignature } from "@upstash/qstash/dist/nextjs";

import { handleError } from "@/server/helpers/handleError";
import { db } from "@/server/db";
import type {
  Contact,
  EmailConfig,
  GroupMeConfig,
  Message,
  SmsConfig,
} from "@prisma/client";
import { env } from "@/env";
import type { MessageWithContactsAndReminders } from "@/server/api/routers/message";

const log = debug("team-send:pages:api:sendMessage");

export const upstash = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

export type SendMessageBody = {
  message: MessageWithContactsAndReminders;
  emailConfig: EmailConfig | null;
  smsConfig: SmsConfig | null;
  groupMeConfig: GroupMeConfig | null;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { message, emailConfig, smsConfig, groupMeConfig } =
    req.body as SendMessageBody;

  try {
    if (!!emailConfig) {
      await sendEmail({
        emailConfig: emailConfig,
        recipients: message.recipients,
        message: message,
      });
    }

    if (!!smsConfig) {
      await sendSMS({
        smsConfig: smsConfig,
        recipients: message.recipients,
        message: message,
      });
    }

    if (!!groupMeConfig) {
      await sendGroupMe({
        groupMeConfig: groupMeConfig,
        recipients: message.recipients,
        message: message,
      });
    }
  } catch (error) {
    await db.message.update({
      where: { id: message.id },
      data: { status: "failed" },
    });

    throw handleError(error);
  }

  res.status(200).json({ message: "Message sent successfully" });
}

export default verifySignature(handler);

export const config = { api: { bodyParser: false } };

export async function sendEmail({
  emailConfig,
  recipients,
  message,
}: {
  emailConfig: EmailConfig;
  recipients: Contact[];
  message: Message;
}) {
  const { accessToken, refreshToken, email } = emailConfig;
  if (!email || !accessToken || !refreshToken) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Account is not properly configured to send email messages",
    });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: email,
      clientId: env.GOOGLE_ID_DEV,
      clientSecret: env.GOOGLE_SECRET_DEV,
      refreshToken: refreshToken,
      accessToken: accessToken,
    },
  });

  try {
    for (const recipient of recipients) {
      const recipientEmail = recipient.email;
      if (!recipientEmail) return false;

      await transporter.sendMail({
        from: email,
        to: "jack.watters@me.com",
        // TODO to: recipientEmail,
        subject: message.subject ? message.subject : undefined,
        text: message.content,
      });
    }
  } catch (err) {
    throw handleError(err);
  }
}

export async function sendSMS({
  smsConfig,
  recipients,
  message,
}: {
  smsConfig: SmsConfig;
  recipients: Contact[];
  message: Message;
}) {
  const { accountSid, authToken, phoneNumber } = smsConfig;
  const client = TwilioClient(accountSid, authToken);

  try {
    for (const recipient of recipients) {
      const recipientPhone = recipient.phone;
      if (!recipientPhone) return false;

      await client.messages.create({
        from: phoneNumber,
        to: "+19544949167",
        // TODO to: recipientPhone,
        body: message.content,
      });
    }
  } catch (err) {
    throw handleError(err);
  }
}

export async function sendGroupMe({
  groupMeConfig,
  recipients,
  message,
}: {
  groupMeConfig: GroupMeConfig;
  recipients: Contact[];
  message: Message;
}) {
  console.log("sendGroupMe");

  const { id, accessToken, userId } = groupMeConfig;

  try {
    for (const recipient of recipients) {
      if (!recipient) return false;

      log("sendGroupMe", recipient, id, accessToken, userId, message);
    }
  } catch (err) {
    throw handleError(err);
  }
}
