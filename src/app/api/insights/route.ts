import { NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";
import { getCurrentUser } from "@/lib/current-user";
import { checkRateLimit } from "@/lib/rate-limit";

const MONTHLY_BULLETS_PROMPT =
  "You are a finance analyst for Cosfy, a personal budgeting app. Given category-wise spend for this month vs last month (in INR), write 3-4 short bullet insights: what went up, what went down, and one concrete actionable tip. Keep each bullet under 20 words. No markdown headers, just short lines starting with -.";

const REPORT_TAKE_PROMPT =
  "You are a finance coach for Cosfy writing the closing 'coach take' on a user's monthly report. You'll be given that month's spend, income, surplus, evidence-backed leaks (where money is quietly going), and wins (real improvements). Write one short encouraging-but-honest paragraph (under 60 words) that references the real numbers given, no generic advice, no markdown.";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI insights aren't set up yet. Set GEMINI_API_KEY on the server." }, { status: 503 });
  }

  const user = await getCurrentUser();
  const rl = await checkRateLimit("insights", user.id, { requests: 20, windowSeconds: 60 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests, try again shortly." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  const body = await req.json().catch(() => null);
  const kind = body?.kind === "report-take" ? "report-take" : "monthly-bullets";

  try {
    if (kind === "report-take") {
      const insights = await callGemini({
        apiKey,
        systemPrompt: REPORT_TAKE_PROMPT,
        messages: [{ role: "user", content: JSON.stringify(body?.report ?? {}) }],
      });
      return NextResponse.json({ insights });
    }

    const thisMonth = body?.thisMonth ?? {};
    const lastMonth = body?.lastMonth ?? {};
    const insights = await callGemini({
      apiKey,
      systemPrompt: MONTHLY_BULLETS_PROMPT,
      messages: [
        { role: "user", content: `This month: ${JSON.stringify(thisMonth)}\nLast month: ${JSON.stringify(lastMonth)}` },
      ],
    });
    return NextResponse.json({ insights });
  } catch (err) {
    console.error("[api/insights]", err);
    return NextResponse.json({ error: "Couldn't generate insights right now. Try again shortly." }, { status: 502 });
  }
}
