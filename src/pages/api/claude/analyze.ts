import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";
import { createServerClient } from "@supabase/ssr";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verify admin role
  const supabaseServer = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies[name];
        },
        set() {},
        remove() {},
      },
    }
  );

  const { data: { session } } = await supabaseServer.auth.getSession();

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (profile?.role !== "admin") {
    return res.status(403).json({ error: "Forbidden - Admin only" });
  }

  const { ticker, name, type, price, ret1yr, ret5yr, signal, expense, dividendYield, pickId } = req.body;

  if (!ticker || !name || !type) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const prompt = `You are a warm, knowledgeable financial educator writing for women who are new to investing. Avoid jargon. Be encouraging and practical.

Analyze this ${type.toUpperCase()} investment for a beginner investor:
- Ticker: ${ticker}
- Name: ${name}
- Current Price: $${price}
- 1-Year Return: ${ret1yr}%
- 5-Year Return: ${ret5yr}%
- Signal: ${signal}
- Expense Ratio: ${expense}
- Dividend Yield: ${dividendYield}

Provide a JSON response with these exact fields:
{
  "rationale": "2-3 sentences explaining why this ${type} is a good fit for beginners, what it invests in, and why it's on ${signal} signal. Plain English only.",
  "signalReason": "One short sentence explaining the ${signal} signal timing.",
  "riskNote": "One sentence about the risk level appropriate for this investment.",
  "beginnerNote": "One actionable sentence for someone buying their first shares."
}

Return ONLY valid JSON, no markdown, no additional text.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: prompt
        }]
      })
    });

    const data = await response.json();
    const analysis = JSON.parse(data.content[0].text);

    // Update pick if pickId provided
    if (pickId) {
      await supabase
        .from("picks")
        .update({
          advice: analysis.rationale,
          signal_reason: analysis.signalReason,
          signal,
          updated_at: new Date().toISOString()
        })
        .eq("id", pickId);
    }

    res.status(200).json(analysis);
  } catch (error) {
    console.error("Claude API error:", error);
    res.status(500).json({ error: "Failed to generate analysis" });
  }
}