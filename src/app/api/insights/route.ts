import { NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

const SYSTEM_PROMPT =
  "You are a finance analyst for Cosfy, a personal budgeting app. Given category-wise spend for this month vs last month (in INR), write 3-4 short bullet insights: what went up, what went down, and one concrete actionable tip. Keep each bullet under 20 words. No markdown headers, just short lines starting with -.";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI insights aren't set up yet. Set GEMINI_API_KEY on the server." }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const thisMonth = body?.thisMonth ?? {};
  const lastMonth = body?.lastMonth ?? {};

  try {
    const insights = await callGemini({
      apiKey,
      systemPrompt: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: `This month: ${JSON.stringify(thisMonth)}\nLast month: ${JSON.stringify(lastMonth)}` },
      ],
    });
    return NextResponse.json({ insights });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "AI request failed." }, { status: 502 });
  }
}
