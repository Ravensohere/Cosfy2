import { NextResponse } from "next/server";
import { extractBillFromImage } from "@/lib/vision-parse";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Bill scanning isn't set up yet. Set GEMINI_API_KEY on the server." },
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
    const bill = await extractBillFromImage(apiKey, dataUrl);
    if (bill.items.length === 0) {
      return NextResponse.json({ error: "Couldn't find any items on that bill. Try a clearer photo, or enter them manually." }, { status: 422 });
    }
    return NextResponse.json(bill);
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Couldn't read that bill: ${detail.slice(0, 150)}` }, { status: 502 });
  }
}
