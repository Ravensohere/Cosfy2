import { NextResponse } from "next/server";
import { fetchFinanceNews, wantsLiveNews } from "@/lib/finance-news";
import { getCurrentUser } from "@/lib/current-user";

const SYSTEM_PROMPT = `You are Cosfy's finance assistant, built into a personal budgeting app for India.
Answer questions about budgeting, saving, spending habits, credit, taxes, and general market/finance concepts in short, plain language.
If live news headlines are provided in context, ground your answer in them and mention it's based on recent headlines.
You are not a licensed financial advisor. Never tell the user to buy/sell a specific instrument as guaranteed advice — frame things as information, not instructions.
Keep answers under 150 words unless the user asks for detail.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const apiKey = user.openaiApiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Add your OpenAI API key in Profile → OpenAI API key to use the chatbot." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => null);
  const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : [];
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  let usedLiveData = false;
  let sources: { title: string; url: string }[] = [];
  const contextMessages: { role: "system"; content: string }[] = [];

  if (wantsLiveNews(lastUserMessage)) {
    const headlines = await fetchFinanceNews(lastUserMessage);
    if (headlines.length > 0) {
      usedLiveData = true;
      sources = headlines.map((h) => ({ title: h.title, url: h.url }));
      const digest = headlines
        .map((h, i) => `${i + 1}. ${h.title} (${h.source}, sentiment: ${h.sentiment})\n${h.summary}`)
        .join("\n\n");
      contextMessages.push({
        role: "system",
        content: `Recent finance headlines (may be a few minutes old):\n\n${digest}`,
      });
    }
  }

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...contextMessages, ...messages],
      temperature: 0.4,
      max_tokens: 400,
    }),
  });

  if (!openaiRes.ok) {
    const detail = await openaiRes.text().catch(() => "");
    return NextResponse.json({ error: `OpenAI request failed: ${detail.slice(0, 200)}` }, { status: 502 });
  }

  const data = await openaiRes.json();
  const reply = data?.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a reply.";

  return NextResponse.json({ reply, usedLiveData, sources });
}
