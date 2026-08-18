import { NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/voice-transcribe";
import { parseQuickAdd } from "@/lib/quick-add-parser";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Voice import isn't set up yet. Set GEMINI_API_KEY on the server." },
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
    console.error("[import/voice]", err);
    return NextResponse.json({ error: "Couldn't transcribe that. Try again or type it manually." }, { status: 502 });
  }
}
