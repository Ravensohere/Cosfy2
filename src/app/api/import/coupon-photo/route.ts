import { NextResponse } from "next/server";
import { extractCouponFromImage } from "@/lib/vision-parse";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Coupon scanning isn't set up yet. Set GEMINI_API_KEY on the server." },
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
    const coupon = await extractCouponFromImage(apiKey, dataUrl);
    if (!coupon.title && !coupon.code) {
      return NextResponse.json({ error: "Couldn't read an offer from that photo. Try a clearer shot, or enter it manually." }, { status: 422 });
    }
    return NextResponse.json(coupon);
  } catch (err) {
    console.error("[import/coupon-photo]", err);
    return NextResponse.json({ error: "Couldn't read that coupon. Try again or enter it manually." }, { status: 502 });
  }
}
