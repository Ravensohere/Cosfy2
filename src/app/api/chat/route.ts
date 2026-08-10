import { NextResponse } from "next/server";
import { fetchFinanceNews, wantsLiveNews } from "@/lib/finance-news";
import { callGemini } from "@/lib/gemini";
import { getCurrentUser } from "@/lib/current-user";
import { buildFinancialContext, toPromptSummary } from "@/lib/financial-context";

const SYSTEM_PROMPT = `You are Cosfy's finance assistant, built into a personal budgeting app for India.
Answer questions about budgeting, saving, spending habits, credit, taxes, and general market/finance concepts in short, plain language.
If live news headlines are provided in context, ground your answer in them and mention it's based on recent headlines.
You are not a licensed financial advisor. Never tell the user to buy/sell a specific instrument as guaranteed advice — frame things as information, not instructions.
Keep answers under 150 words unless the user asks for detail.
Format with light markdown: **bold** the key numbers/terms, and use "- " bullets for steps or lists — nothing fancier (no headers, no tables).`;

const MAX_HISTORY = 10;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const allMessages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : [];
  const messages = allMessages.slice(-MAX_HISTORY);
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  let usedLiveData = false;
  let sources: { title: string; url: string }[] = [];
  let systemPrompt = SYSTEM_PROMPT;

  const user = await getCurrentUser();
  const context = await buildFinancialContext(user.id);

  systemPrompt += `\n\nAbout the person you're talking to: ${
    user.preferredName ? `they go by ${user.preferredName}.` : "no name on file, don't guess one."
  }\n\nTheir financial picture:\n${toPromptSummary(context)}\n\nUse this only when it's actually relevant to their question — don't force it into every answer.`;

  if (user.language === "hi") {
    systemPrompt += `\n\nReply in conversational Hindi (Devanagari script), the way a fluent Hindi speaker actually talks about money — not a stiff word-for-word translation. Keep numbers and ₹ amounts as digits.`;
  }

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
