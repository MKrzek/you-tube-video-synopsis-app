import { NextApiRequest, NextApiResponse } from "next";
import sgMail from '@sendgrid/mail';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {

    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)
    const msg = {
      to: 'test@example.com',
      from: 'test@example.com',
      subject: 'Sending with SendGrid is Fun',
      text: 'and easy to do anywhere, even with Node.js',
      html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    }
    await sgMail.send(msg)
  } catch (e) {

  }
}