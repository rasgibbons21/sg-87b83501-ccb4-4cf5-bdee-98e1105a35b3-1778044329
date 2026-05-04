import type { NextApiRequest, NextApiResponse } from "next";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

const POSITIVE_KEYWORDS = ["beat", "exceed", "surge", "gain", "record", "growth", "profit"];
const NEGATIVE_KEYWORDS = ["miss", "fall", "drop", "loss", "decline", "cut", "warn"];

function analyzeSentiment(headline: string): "positive" | "negative" | "neutral" {
  const lowerHeadline = headline.toLowerCase();
  
  const hasPositive = POSITIVE_KEYWORDS.some(kw => lowerHeadline.includes(kw));
  const hasNegative = NEGATIVE_KEYWORDS.some(kw => lowerHeadline.includes(kw));
  
  if (hasPositive && !hasNegative) return "positive";
  if (hasNegative && !hasPositive) return "negative";
  return "neutral";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ticker } = req.query;

  if (!ticker || typeof ticker !== "string") {
    return res.status(400).json({ error: "Ticker parameter is required" });
  }

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];

    const response = await fetch(
      `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${sevenDaysAgo}&to=${today}&token=${FINNHUB_API_KEY}`
    );

    const news = await response.json();

    if (!Array.isArray(news)) {
      return res.status(200).json([]);
    }

    const processedNews = news.slice(0, 10).map((item: any) => ({
      headline: item.headline,
      source: item.source,
      sentiment: analyzeSentiment(item.headline),
      datetime: item.datetime,
      url: item.url
    }));

    res.setHeader("Cache-Control", "public, s-maxage=300");
    res.status(200).json(processedNews);
  } catch (error) {
    console.error("News API error:", error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
}