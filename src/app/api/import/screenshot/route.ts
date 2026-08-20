import { NextResponse } from "next/server";
import { extractExpenseFromImage } from "@/lib/vision-parse";
import { guessCategory, guessPaymentMode } from "@/lib/quick-add-parser";
import { getCurrentUser } from "@/lib/current-user";
import { validateUpload } from "@/lib/validate-upload";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Screenshot import isn't set up yet. Set GEMINI_API_KEY on the server." },
      { status: 503 }
    );
  }

  const user = await getCurrentUser();
  const rl = await checkRateLimit("import-screenshot", user.id, { requests: 20, windowSeconds: 60 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests, try again shortly." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image uploaded." }, { status: 400 });
  }

  const validation = validateUpload(file, "image");
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
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
    console.error("[import/screenshot]", err);
    return NextResponse.json({ error: "Couldn't read that image. Try again or enter it manually." }, { status: 502 });
  }
}
