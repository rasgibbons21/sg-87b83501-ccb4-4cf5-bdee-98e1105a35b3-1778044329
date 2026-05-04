import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ticker } = req.query;

  if (!ticker || typeof ticker !== "string") {
    return res.status(400).json({ error: "Ticker parameter is required" });
  }

  try {
    // Check database for recent data (< 24 hours old)
    const { data: pick } = await supabase
      .from("picks")
      .select("ret_1yr, ret_5yr, updated_at")
      .eq("ticker", ticker)
      .single();

    const isRecent = pick?.updated_at && 
      (Date.now() - new Date(pick.updated_at).getTime()) < 24 * 60 * 60 * 1000;

    if (isRecent && pick.ret_1yr !== null && pick.ret_5yr !== null) {
      const val100_1yr = (100 * (1 + pick.ret_1yr / 100)).toFixed(2);
      const val100_5yr = (100 * Math.pow(1 + pick.ret_5yr / 100, 5)).toFixed(2);

      return res.status(200).json({
        ret1yr: pick.ret_1yr,
        ret5yr: pick.ret_5yr,
        val100_1yr,
        val100_5yr
      });
    }

    // Fetch from Twelve Data API
    const [oneYearData, fiveYearData] = await Promise.all([
      fetch(`https://api.twelvedata.com/time_series?symbol=${ticker}&interval=1day&outputsize=252&apikey=${TWELVE_DATA_API_KEY}`).then(r => r.json()),
      fetch(`https://api.twelvedata.com/time_series?symbol=${ticker}&interval=1day&outputsize=1260&apikey=${TWELVE_DATA_API_KEY}`).then(r => r.json())
    ]);

    const calc1yr = oneYearData.values?.[0] && oneYearData.values?.[oneYearData.values.length - 1]
      ? ((parseFloat(oneYearData.values[0].close) - parseFloat(oneYearData.values[oneYearData.values.length - 1].close)) / parseFloat(oneYearData.values[oneYearData.values.length - 1].close)) * 100
      : null;

    const calc5yr = fiveYearData.values?.[0] && fiveYearData.values?.[fiveYearData.values.length - 1]
      ? ((parseFloat(fiveYearData.values[0].close) - parseFloat(fiveYearData.values[fiveYearData.values.length - 1].close)) / parseFloat(fiveYearData.values[fiveYearData.values.length - 1].close)) * 100
      : null;

    // Update database
    if (calc1yr !== null && calc5yr !== null) {
      await supabase
        .from("picks")
        .update({ ret_1yr: calc1yr, ret_5yr: calc5yr, updated_at: new Date().toISOString() })
        .eq("ticker", ticker);
    }

    const val100_1yr = calc1yr ? (100 * (1 + calc1yr / 100)).toFixed(2) : "100.00";
    const val100_5yr = calc5yr ? (100 * Math.pow(1 + calc5yr / 100, 5)).toFixed(2) : "100.00";

    res.status(200).json({
      ret1yr: calc1yr || 0,
      ret5yr: calc5yr || 0,
      val100_1yr,
      val100_5yr
    });
  } catch (error) {
    console.error("History API error:", error);
    res.status(500).json({ error: "Failed to fetch historical data" });
  }
}