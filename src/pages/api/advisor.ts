import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, userId, userContext } = req.body;

    if (!message || !userId) {
      return res.status(400).json({ error: "Message and userId required" });
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      return res.status(500).json({ error: "Anthropic API key not configured" });
    }

    // Build system prompt with user context
    const systemPrompt = `You are Bloom's personal financial advisor. You are warm, knowledgeable, and speak in plain English without jargon. You are specifically helping women investors — many are single mothers, stay-at-home mothers, or working mothers — learn to invest confidently.

USER CONTEXT:
- Monthly investing budget: $${userContext?.investMonthly || 0}
- Child age: ${userContext?.childAge !== null ? userContext.childAge + " years old" : "No children specified"}
- College savings goal: $${userContext?.collegeGoal || 0}
- Currently watching: ${userContext?.watchlist?.join(", ") || "No tickers yet"}

YOUR ROLE:
- Answer investing questions in simple, conversational language
- Give specific, actionable advice based on their budget
- Explain concepts like you're talking to a friend over coffee
- Never use financial jargon without explaining it
- Be encouraging and supportive — investing can feel intimidating
- Reference their watchlist tickers when relevant
- Suggest specific dollar amounts based on their budget

RESPONSE STYLE:
- Keep responses under 200 words
- Use short paragraphs
- Be direct and practical
- End with a specific next step when appropriate`;

    // Get recent conversation history
    const { data: history } = await supabaseAdmin
      .from("advisor_conversations")
      .select("role, content")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(10);

    const messages = [
      ...(history || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    // Call Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Claude API error:", errorData);
      return res.status(500).json({ error: "Failed to get AI response" });
    }

    const data = await response.json();
    const assistantMessage = data.content[0].text;

    // Save both messages to database
    await supabaseAdmin.from("advisor_conversations").insert([
      { user_id: userId, role: "user", content: message },
      { user_id: userId, role: "assistant", content: assistantMessage }
    ]);

    res.status(200).json({ response: assistantMessage });
  } catch (error) {
    console.error("Advisor API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}