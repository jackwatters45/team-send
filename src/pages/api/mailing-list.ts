// /pages/api/mailing-list.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";
import debug from "debug";

import { env } from "@/env";
import { db } from "@/server/db";
import type { MailingFormSchema } from "@/components/forms/MailingForm";
import { getBaseURL } from "@/lib/utils";

export const prerender = false;

const log = debug("team-send:pages:api:mailing-list");

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(50, "1 h"),
  analytics: true,
});

const rateLimitNoKey = async () => {
  const { success } = await ratelimit.limit("mailing-list");
  if (!success)
    throw new Error("Rate limit exceeded. Try again in 10 seconds.");
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    return addToMailingList(req, res);
  } else if (req.method === "GET") {
    return removeFromMailingList(req, res);
  }
}

async function addToMailingList(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed, only POST requests are allowed",
    });
  }

  const data = req.body as MailingFormSchema;
  if (!data) {
    return res.status(400).json({ message: "Invalid form data submitted.." });
  }
  const { name, email } = data;

  try {
    await rateLimitNoKey();

    const user = await db.user.findUnique({
      where: { email },
    });

    const subscriber = await db.mailingListRecipient.findUnique({
      where: { email },
    });

    if (subscriber) {
      if (subscriber.status === "active")
        return res.status(200).json({ message: "Already subscribed" });

      await db.mailingListRecipient.update({
        where: { email },
        data: user
          ? { status: "active", user: { connect: { id: user.id } } }
          : { status: "active" },
      });
    } else {
      await db.mailingListRecipient.create({
        data: user
          ? { name, email, user: { connect: { id: user.id } } }
          : { name, email },
      });
    }

    const meep = env.RESEND_API_KEY;
    const resend = new Resend(meep);

    await resend.emails.send({
      from: "Team Send <support@yatusabes.co>",
      to: email,
      subject: "Welcome to the Team Send community!",
      html: getMessage({ name, email }),
    });

    return res.status(201).json({ message: "Added to mailing list" });
  } catch (error) {
    log(error);
    return res.status(500).json({ message: "Failed to add to mailing list" });
  }
}

// remove from mailing list
async function removeFromMailingList(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      message: "Method not allowed, only GET requests are allowed",
    });
  }

  const emailParam = req.query.email as string;
  if (!emailParam) {
    return res.status(400).json({ message: "Invalid email search param" });
  }

  try {
    await rateLimitNoKey();

    await db.mailingListRecipient.update({
      where: { email: emailParam },
      data: { status: "inactive" },
    });

    return res.status(302).json({ message: "Unsubscribed successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to unsubscribe" });
  }
}

const getMessage = ({ name, email }: MailingFormSchema) => `<!DOCTYPE html>
<html>
<head>
<style>
body {
  font-family: sans-serif;
  margin: 0;
  padding: 0;
  background-color: #1c1917;
  color: #fafaf9;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.container {
  max-width: 500px;
  margin: 40px auto;
  padding: 40px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.logo {
  display: block;
  margin: 0 auto 25px auto;
  width: 100px;
  height: auto;
}
.header {
  text-align: center;
  color: #67e8f9;
  margin-bottom: 40px;
}
.header h1 {
  font-size: 24px;
  margin: 0;
  font-weight: bold;
}
.content {
  font-size: 16px;
  display: flex;
  flex-direction: column;
  line-height: 2;
}
.content p {
  font-size: 16px;
}
.signature {
  font-weight: bold;
  line-height: 2;
}
.footer {
  margin-top: 2rem;
  padding-top: 20px;
  border-top: 1px solid #a8a29e;
  text-align: center;
  font-size: 12px;
  color: #a8a29e;
}
</style>
</head>
<body>
<div class="container">
<img
  src="https://res.cloudinary.com/drheg5d7j/image/upload/v1713845385/Yats-logo-no-background_b9zh7w.webp"
  alt=""
  class="logo"
/>
<div class="header">
  <h1>Welcome to the Team Send Community!</h1>
</div>
<div class="content">
  <p>Hello <span class="recipient-name">${name}</span>,</p>
  <p>Thank you for joining our mailing list! We're thrilled to have you onboard. You'll start receiving updates, news, and exclusive offers straight to your inbox.</p>
</div>
<div class="signature">
  Thanks for your patience,<br />
  Team Send Support
</div>
<div class="footer">
<p class="unsubscribe">If you did not intend to join our mailing list or wish to opt-out, please <a href="${getBaseURL()}/unsubscribe?email=${email}">click here</a> to unsubscribe.</p>
  <p>
    If you have any questions, feel free to <a
      href="mailto:support@yatusabes.co">contact us</a
    >.
  </p>
  <p>© 2024 Yats Co. All rights reserved.</p>
</div>

</body>
</html>`;
