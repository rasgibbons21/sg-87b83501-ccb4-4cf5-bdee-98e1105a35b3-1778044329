import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const TICKERS = ["VTI", "QQQ", "SCHD", "BND", "VXUS", "AAPL", "MSFT", "JNJ", "NVDA", "TSLA", "SPY", "GLD"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check cache first
    const { data: cachedPrices } = await supabase
      .from("price_cache")
      .select("*")
      .gte("cached_at", new Date(Date.now() - 60000).toISOString());

    const cachedTickers = new Set((cachedPrices || []).map((p: any) => p.ticker));
    const missingTickers = TICKERS.filter(t => !cachedTickers.has(t));

    // If all cached, return
    if (missingTickers.length === 0 && cachedPrices) {
      return res.status(200).json(cachedPrices.map((p: any) => ({
        ticker: p.ticker,
        price: p.price,
        changePct: p.change_pct,
        priceUp: p.price_up
      })));
    }

    // Fetch missing from Finnhub
    const freshPrices = [];
    for (const ticker of missingTickers) {
      try {
        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_API_KEY}`
        );
        const data = await response.json();
        
        if (data.c && data.dp !== undefined) {
          freshPrices.push({
            ticker,
            price: data.c,
            change_pct: data.dp,
            price_up: data.dp > 0,
            cached_at: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error(`Error fetching ${ticker}:`, error);
      }
    }

    // Update cache
    if (freshPrices.length > 0) {
      const { error } = await supabase
        .from("price_cache")
        .upsert(freshPrices, { onConflict: "ticker" });
      
      if (error) console.error("Cache update error:", error);
    }

    // Combine cached and fresh
    const allPrices = [
      ...(cachedPrices || []).map((p: any) => ({
        ticker: p.ticker,
        price: p.price,
        changePct: p.change_pct,
        priceUp: p.price_up
      })),
      ...freshPrices.map(p => ({
        ticker: p.ticker,
        price: p.price,
        changePct: p.change_pct,
        priceUp: p.price_up
      }))
    ];

    res.status(200).json(allPrices);
  } catch (error) {
    console.error("Price API error:", error);
    res.status(500).json({ error: "Failed to fetch prices" });
  }
}