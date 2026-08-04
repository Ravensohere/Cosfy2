import { NextResponse } from "next/server";
import { extractExpenseFromImage } from "@/lib/vision-parse";
import { guessCategory, guessPaymentMode } from "@/lib/quick-add-parser";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Screenshot import isn't set up yet. Set GEMINI_API_KEY on the server." },
      { status: 503 }
    );
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image uploaded." }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const dataUrl = `data:${file.type || "image/jpeg"};base64,${base64}`;

  try {
    const extracted = await extractExpenseFromImage(apiKey, dataUrl);
    if (!extracted.amount) {
      return NextResponse.json({ error: "Couldn't find an amount in that image." }, { status: 422 });
    }
    return NextResponse.json({
      amount: extracted.amount,
      description: extracted.merchant,
      isCredit: extracted.isCredit,
      category: extracted.isCredit ? "Income" : guessCategory(extracted.merchant),
      paymentMode: guessPaymentMode(extracted.merchant),
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Couldn't read that image: ${detail.slice(0, 150)}` }, { status: 502 });
  }
}
