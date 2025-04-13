import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { Converter } from "showdown";
import axios from "axios";

const schema = z.object({
  summary: z.string()
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  try {
    const { sessionClaims } = getAuth(req)

    if (!sessionClaims?.primaryEmail) {
      return res.status(401).json({ error: "You are not authenticated" });
    }

    const { data, error } = schema.safeParse(req.body);
    if (error) {
      return res.status(400).json({ error: error.errors });
    }

    if (!data.summary.trim()) {
      return res.status(400).json({ error: "Empty markdown content. PDF generation skipped." });
    }

    const converter = new Converter({ tables: true, strikethrough: true });
    const htmlDocument = converter.makeHtml(data.summary);
    const pdfData = `<html>${ htmlDocument }</html>`;

    const response = await axios.post(
      "https://pdfswitch.io/api/convert/",
      {
        source: pdfData,
        filename: "summary.pdf"
      },
      { headers: { Authorization: `Bearer ${ process.env.PDF_SWITCH_API_KEY }` } }
    );

    console.log('response,', response)
    res.status(200).send({ pdfUrl: response.data.url });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      res.status(error?.status ?? 500).json({ error: error.message ?? 'Failed to download PDF' })
    }
  }
}