// pages/api/sendMessage.ts
import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import TwilioClient from "twilio";
import { TRPCError } from "@trpc/server";
import { Redis } from "@upstash/redis";
import debug from "debug";
import { verifySignature } from "@upstash/qstash/dist/nextjs";
import Pusher from "pusher";
import type {
  EmailConfig,
  GroupMeConfig,
  Message,
  SmsConfig,
} from "@prisma/client";

import { handleError } from "@/server/helpers/handleError";
import { db } from "@/server/db";
import { env } from "@/env";
import type {
  PopulatedMessageWithGroupName,
  RecipientOnlyContact,
} from "@/server/api/routers/message";

const log = debug("team-send:pages:api:sendMessage");

export const upstash = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

const pusher = new Pusher({
  appId: env.PUSHER_APP_ID,
  key: env.PUSHER_KEY,
  secret: env.PUSHER_SECRET,
  cluster: env.PUSHER_CLUSTER,
  useTLS: true,
});

type UserIdWithConfig = {
  id: string;
  emailConfig: EmailConfig | null;
  smsConfig: SmsConfig | null;
  groupMeConfig: GroupMeConfig | null;
};

export type SendMessageBody = {
  message: PopulatedMessageWithGroupName;
  user: UserIdWithConfig;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    message,
    user: { emailConfig, smsConfig, groupMeConfig, id: userId },
  } = req.body as SendMessageBody;

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

    const status = "sent";

    await db.message.update({
      where: { id: message.id },
      data: { status, sendAt: new Date() },
    });

    await pusher.trigger(`user-${userId}`, "message-status", {
      status,
      messageId: message.id,
      groupName: message.group.name,
    });
  } catch (error) {
    const status = "failed";

    await db.message.update({
      where: { id: message.id },
      data: { status },
    });

    await pusher.trigger(`user-${userId}`, "message-status", {
      status,
      messageId: message.id,
      groupName: message.group.name,
    });

    res.status(500).json({ message: "Message send failed" });
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
  recipients: RecipientOnlyContact[];
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
      const recipientEmail = recipient.member.contact.email;
      if (!recipientEmail) return false;

      await transporter.sendMail({
        from: email,
        to: recipientEmail,
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
  recipients: RecipientOnlyContact[];
  message: Message;
}) {
  const { accountSid, authToken, phoneNumber } = smsConfig;
  const client = TwilioClient(accountSid, authToken);

  try {
    for (const recipient of recipients) {
      const recipientPhone = recipient.member.contact.phone;
      if (!recipientPhone) return false;

      await client.messages.create({
        from: phoneNumber,
        to: recipientPhone,
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
  recipients: RecipientOnlyContact[];
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
