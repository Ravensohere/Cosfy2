import { NextResponse } from "next/server";
import { extractTransactionsFromImage } from "@/lib/vision-parse";
import { guessCategory, guessPaymentMode } from "@/lib/quick-add-parser";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Scanning isn't set up yet. Set GEMINI_API_KEY on the server." },
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
    const transactions = await extractTransactionsFromImage(apiKey, dataUrl);
    if (transactions.length === 0) {
      return NextResponse.json({ error: "Couldn't find any transactions in that image." }, { status: 422 });
    }
    return NextResponse.json({
      transactions: transactions.map((t) => ({
        description: t.description,
        amount: t.amount,
        isCredit: t.isCredit,
        category: t.isCredit ? "Income" : guessCategory(t.description),
        paymentMode: guessPaymentMode(t.description),
      })),
    });
  } catch (err) {
    console.error("[import/transactions-photo]", err);
    return NextResponse.json({ error: "Couldn't read that image. Try again or enter it manually." }, { status: 502 });
  }
}
