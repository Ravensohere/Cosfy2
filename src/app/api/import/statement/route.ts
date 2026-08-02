import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { parseCsvStatement, parsePdfStatement } from "@/lib/statement-parser";

export async function POST(req: Request) {
  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  try {
    if (isPdf) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      const rows = parsePdfStatement(result.text);
      return NextResponse.json({ rows, format: "pdf" });
    }

    const text = await file.text();
    const rows = parseCsvStatement(text);
    return NextResponse.json({ rows, format: "csv" });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Couldn't read that file: ${detail.slice(0, 150)}` }, { status: 502 });
  }
}
