import { NextResponse } from "next/server";
import { fetchFinanceNews, wantsLiveNews } from "@/lib/finance-news";
import { getCurrentUser } from "@/lib/current-user";
import { friendlyOpenAIError } from "@/lib/openai-error";
import { callGemini } from "@/lib/gemini";

const SYSTEM_PROMPT = `You are Cosfy's finance assistant, built into a personal budgeting app for India.
Answer questions about budgeting, saving, spending habits, credit, taxes, and general market/finance concepts in short, plain language.
If live news headlines are provided in context, ground your answer in them and mention it's based on recent headlines.
You are not a licensed financial advisor. Never tell the user to buy/sell a specific instrument as guaranteed advice — frame things as information, not instructions.
Keep answers under 150 words unless the user asks for detail.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

async function callOpenAI(apiKey: string, systemPrompt: string, messages: ChatMessage[]) {
  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.4,
      max_tokens: 400,
    }),
  });

  if (!openaiRes.ok) {
    throw new Error(await friendlyOpenAIError(openaiRes));
  }

  const data = await openaiRes.json();
  return data?.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a reply.";
}

export async function POST(req: Request) {
  const user = await getCurrentUser();

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

  // Personal OpenAI key wins if the user set one up; otherwise Gemini Flash (server key)
  // powers the assistant by default, with a shared OpenAI key as a last-resort fallback.
  const provider = user.openaiApiKey ? "openai" : process.env.GEMINI_API_KEY ? "gemini" : "openai-shared";

  try {
    let reply: string;
    if (provider === "openai") {
      reply = await callOpenAI(user.openaiApiKey!, systemPrompt, messages);
    } else if (provider === "gemini") {
      reply = await callGemini({ apiKey: process.env.GEMINI_API_KEY!, systemPrompt, messages });
    } else if (process.env.OPENAI_API_KEY) {
      reply = await callOpenAI(process.env.OPENAI_API_KEY, systemPrompt, messages);
    } else {
      return NextResponse.json(
        { error: "Ask AI isn't set up yet. Add your own OpenAI key in Profile → OpenAI API key." },
        { status: 503 }
      );
    }
    return NextResponse.json({ reply, usedLiveData, sources });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "AI request failed." }, { status: 502 });
  }
}
