import { NextResponse } from "next/server";
import { fetchFinanceNews, wantsLiveNews } from "@/lib/finance-news";
import { callGemini } from "@/lib/gemini";

const SYSTEM_PROMPT = `You are Cosfy's finance assistant, built into a personal budgeting app for India.
Answer questions about budgeting, saving, spending habits, credit, taxes, and general market/finance concepts in short, plain language.
If live news headlines are provided in context, ground your answer in them and mention it's based on recent headlines.
You are not a licensed financial advisor. Never tell the user to buy/sell a specific instrument as guaranteed advice — frame things as information, not instructions.
Keep answers under 150 words unless the user asks for detail.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : [];
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  let usedLiveData = false;
  let sources: { title: string; url: string }[] = [];
  let systemPrompt = SYSTEM_PROMPT;

  if (wantsLiveNews(lastUserMessage)) {
    const headlines = await fetchFinanceNews(lastUserMessage);
    if (headlines.length > 0) {
      usedLiveData = true;
      sources = headlines.map((h) => ({ title: h.title, url: h.url }));
      const digest = headlines
        .map((h, i) => `${i + 1}. ${h.title} (${h.source}, sentiment: ${h.sentiment})\n${h.summary}`)
        .join("\n\n");
      systemPrompt += `\n\nRecent finance headlines (may be a few minutes old):\n\n${digest}`;
    }
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Ask AI isn't set up yet. Set GEMINI_API_KEY on the server." },
      { status: 503 }
    );
  }

  try {
    const reply = await callGemini({ apiKey: process.env.GEMINI_API_KEY, systemPrompt, messages });
    return NextResponse.json({ reply, usedLiveData, sources });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "AI request failed." }, { status: 502 });
  }
}
