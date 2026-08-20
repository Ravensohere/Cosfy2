import { NextResponse } from "next/server";
import { extractBillFromImage } from "@/lib/vision-parse";
import { getCurrentUser } from "@/lib/current-user";
import { validateUpload } from "@/lib/validate-upload";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Bill scanning isn't set up yet. Set GEMINI_API_KEY on the server." },
      { status: 503 }
    );
  }

  const user = await getCurrentUser();
  const rl = await checkRateLimit("import-bill-photo", user.id, { requests: 20, windowSeconds: 60 });
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
    const bill = await extractBillFromImage(apiKey, dataUrl);
    if (bill.items.length === 0) {
      return NextResponse.json({ error: "Couldn't find any items on that bill. Try a clearer photo, or enter them manually." }, { status: 422 });
    }
    return NextResponse.json(bill);
  } catch (err) {
    console.error("[import/bill-photo]", err);
    return NextResponse.json({ error: "Couldn't read that bill. Try again or enter it manually." }, { status: 502 });
  }
}
