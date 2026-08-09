import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData().catch(() => null);
  const sharedUrl = (formData?.get("url") || "").toString();
  const text = (formData?.get("text") || formData?.get("title") || "").toString();
  const combinedText = [text, sharedUrl].filter(Boolean).join(" ").trim();

  const url = new URL("/import", req.url);
  if (combinedText) url.searchParams.set("text", combinedText);

  return NextResponse.redirect(url, 303);
}
