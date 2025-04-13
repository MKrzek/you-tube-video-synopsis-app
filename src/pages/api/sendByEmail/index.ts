import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { z } from "zod";
import { Converter } from "showdown";
import SibApiV3Sdk from 'sib-api-v3-sdk';

const schema = z.object({
  summary: z.string()
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { sessionClaims } = getAuth(req)

  if (!sessionClaims?.primaryEmail) {
    return res.status(401).json({ error: "You are not authenticated" });
  }

  const { data, error } = schema.safeParse(req.body);
  if (error) {
    return res.status(400).json({ error: error.errors });
  }

  if (!data.summary.trim()) {
    return res.status(400).json({ error: "Empty markdown content. Email sending skipped." });
  }

  const converter = new Converter({ tables: true, strikethrough: true });
  const htmlDocument = converter.makeHtml(data.summary);
  const HTML = `<html>${ htmlDocument }</html>`;

  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = process.env.BREVO_API_KEY


  const sender = {
    email: 'mkrzek@googlemail.com',
    name: 'Video Summary',
  };

  const receivers = [
    {
      email: sessionClaims.primaryEmail,
      name: 'Video summary',
    },
  ];
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const email = {
    sender,
    to: receivers,
    subject: 'Test Email from Brevo + Node.js',
    htmlContent: HTML,
  };

  try {
    const data = await apiInstance.sendTransacEmail(email);
    console.log('Email sent:', data.messageId || data);
    return res.status(200);
  } catch (error) {
    console.log('eee', error)
  }
}