// pages/api/sendMessage.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { message } = req.body as { message: string };

  // Here you would add the logic to send the message, e.g., via email, SMS, or another service
  console.log("Sending message:", message);

  res.status(200).json({ message: "Message sent successfully" });
}

// async function handler(request: Request) {
//   const data = (await request.json()) as { hello: string };

//   for (let i = 0; i < 10; i++) {
//     await fetch("https://firstqstashmessage.requestcatcher.com/test", {
//       method: "POST",
//       body: JSON.stringify(data),
//       headers: { "Content-Type": "application/json" },
//     });
//     await new Promise((resolve) => setTimeout(resolve, 500));
//   }

//   return Response.json({ success: true });
// }

// import { verifySignatureAppRouter } from "@upstash/qstash/dist/nextjs";
