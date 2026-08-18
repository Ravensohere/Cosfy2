import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { callGemini } from "@/lib/gemini";
import { extractInsuranceDocFromText, extractInsuranceDocFromImage } from "@/lib/insurance-doc-parse";
import { SYSTEM_PROMPT } from "@/app/api/chat/route";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Document scanning isn't set up yet. Set GEMINI_API_KEY on the server." },
      { status: 503 }
    );
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const arrayBuffer = await file.arrayBuffer();

  try {
    let rawText: string;
    let extraction: Awaited<ReturnType<typeof extractInsuranceDocFromText>>;

    if (isPdf) {
      const buffer = Buffer.from(arrayBuffer);
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      rawText = result.text;
      extraction = await extractInsuranceDocFromText(apiKey, rawText);
    } else {
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const dataUrl = `data:${file.type || "image/jpeg"};base64,${base64}`;
      extraction = await extractInsuranceDocFromImage(apiKey, dataUrl);
      rawText = "";
    }

    if (!extraction.policyName && !extraction.provider && extraction.summary.subLimits.length === 0) {
      return NextResponse.json(
        { error: "Couldn't read that as an insurance document. Try a clearer scan, or the original PDF." },
        { status: 422 }
      );
    }

    const user = await getCurrentUser();
    const doc = await db.insuranceDocument.create({
      data: {
        userId: user.id,
        fileName: file.name,
        type: extraction.type,
        subType: extraction.subType,
        provider: extraction.provider,
        policyName: extraction.policyName,
        sumInsured: extraction.sumInsured,
        premiumAmount: extraction.premiumAmount,
        frequency: extraction.frequency,
        rawText: rawText.slice(0, 20000),
        summary: extraction.summary,
      },
    });

    const confirmationPrompt = `I just uploaded an insurance document. Here's what was extracted from it as JSON:\n\n${JSON.stringify(
      { type: extraction.type, subType: extraction.subType, provider: extraction.provider, policyName: extraction.policyName, sumInsured: extraction.sumInsured, ...extraction.summary }
    )}\n\nGive me a short (2-4 sentence) confirmation of what this policy covers, and flag anything important I should know (like room rent capping, co-pay, or sub-limits) if the data shows it.`;

    const reply = await callGemini({
      apiKey,
      systemPrompt: SYSTEM_PROMPT,
      messages: [{ role: "user", content: confirmationPrompt }],
    });

    return NextResponse.json({
      reply,
      doc: { id: doc.id, type: doc.type, subType: doc.subType, policyName: doc.policyName, provider: doc.provider },
    });
  } catch (err) {
    console.error("[import/insurance-doc]", err);
    return NextResponse.json({ error: "Couldn't read that document. Try again or enter it manually." }, { status: 502 });
  }
}
