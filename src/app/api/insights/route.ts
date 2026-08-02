import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { friendlyOpenAIError } from "@/lib/openai-error";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const apiKey = user.openaiApiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Add your OpenAI API key in Profile to get AI spending insights." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => null);
  const thisMonth = body?.thisMonth ?? {};
  const lastMonth = body?.lastMonth ?? {};

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a finance analyst for Cosfy, a personal budgeting app. Given category-wise spend for this month vs last month (in INR), write 3-4 short bullet insights: what went up, what went down, and one concrete actionable tip. Keep each bullet under 20 words. No markdown headers, just short lines starting with -.",
        },
        {
          role: "user",
          content: `This month: ${JSON.stringify(thisMonth)}\nLast month: ${JSON.stringify(lastMonth)}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 300,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: await friendlyOpenAIError(res) }, { status: 502 });
  }

  const data = await res.json();
  const insights = data?.choices?.[0]?.message?.content ?? "Couldn't generate insights right now.";
  return NextResponse.json({ insights });
}
