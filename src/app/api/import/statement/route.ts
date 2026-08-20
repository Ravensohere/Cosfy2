import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { parseCsvStatement, parsePdfStatement } from "@/lib/statement-parser";
import { getCurrentUser } from "@/lib/current-user";
import { validateUpload, UPLOAD_KIND } from "@/lib/validate-upload";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const rl = await checkRateLimit("import-statement", user.id, { requests: 10, windowSeconds: 60 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests, try again shortly." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  // "document" kind (image/pdf mimes) doesn't cover CSV, which this route also
  // accepts, so only run it for the PDF branch and size/empty-check CSVs directly.
  if (isPdf) {
    const validation = validateUpload(file, "document");
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
  } else {
    if (file.size === 0) {
      return NextResponse.json({ error: "That file is empty." }, { status: 400 });
    }
    if (file.size > UPLOAD_KIND.document.maxBytes) {
      return NextResponse.json(
        { error: `File is too large (max ${Math.floor(UPLOAD_KIND.document.maxBytes / (1024 * 1024))}MB).` },
        { status: 400 }
      );
    }
  }

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
    console.error("[import/statement]", err);
    return NextResponse.json({ error: "Couldn't read that file. Try again or enter transactions manually." }, { status: 502 });
  }
}
