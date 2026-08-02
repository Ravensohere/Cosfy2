import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { transcribeAudio } from "@/lib/voice-transcribe";
import { parseQuickAdd } from "@/lib/quick-add-parser";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const apiKey = user.openaiApiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Add your OpenAI API key in Profile to use voice import." },
      { status: 503 }
    );
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No audio uploaded." }, { status: 400 });
  }

  try {
    const transcript = await transcribeAudio(apiKey, file);
    const parsed = parseQuickAdd(transcript);
    if (!parsed.amount) {
      return NextResponse.json(
        { error: `Heard "${transcript}" but couldn't find an amount. Try again mentioning a number.` },
        { status: 422 }
      );
    }
    return NextResponse.json({
      transcript,
      amount: parsed.amount,
      description: parsed.description,
      category: parsed.category,
      paymentMode: parsed.paymentMode,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Couldn't transcribe that: ${detail.slice(0, 150)}` }, { status: 502 });
  }
}
