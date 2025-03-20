import { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";
import Redis from "ioredis";
import { z } from "zod";
import { getAuth } from "@clerk/nextjs/server";
import getTranscript from "@/utils/you-tube-transcript";
import extractVideoId from "@/utils/extractVideoId";

const schema = z.object({
  url: z.string().url().refine((val) => val.includes("youtube.com") || val.includes("youtu.be"), {
    message: "Invalid YouTube URL",
  }),
});

const redis = new Redis(process.env.REDIS_URL!);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "You are not authenticated" });
    }

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }

    const { url } = parsed.data;

    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube video URL" });
    }

    const cacheKey = `summary:${ userId }:${ videoId }`;

    const cachedSummary = await redis.get(cacheKey);
    if (cachedSummary) {
      return res.status(200).json({ summary: JSON.parse(cachedSummary) });
    }

    const transcript = await getTranscript(videoId);

    const prompt = `Summarize the following YouTube transcript in bullet points:\n\n${ transcript }. Develop each bullet point if possible.`;

    try {
      const chatResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
      });

      const summary = chatResponse.choices[0]?.message?.content?.trim();
      if (!summary) {
        throw new Error("Failed to generate summary");
      }

      await redis.set(cacheKey, JSON.stringify(summary), "EX", 86400); // Cache for 24 hours

      return res.status(200).json({ summary });
    } catch (openAIError) {
      if (openAIError instanceof Error && "status" in openAIError && openAIError.status === 429) {
        return res.status(429).json({ error: "Quota exceeded. Please check your OpenAI plan." });
      }
      throw openAIError;
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
