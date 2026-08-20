import { NextResponse } from "next/server";

const MAX_SHARED_TEXT_LENGTH = 2000;

export async function POST(req: Request) {
  const formData = await req.formData().catch(() => null);
  const rawUrl = formData?.get("url");
  const rawText = formData?.get("text");
  const rawTitle = formData?.get("title");

  const sharedUrl = typeof rawUrl === "string" ? rawUrl.slice(0, MAX_SHARED_TEXT_LENGTH) : "";
  const text =
    typeof rawText === "string"
      ? rawText.slice(0, MAX_SHARED_TEXT_LENGTH)
      : typeof rawTitle === "string"
        ? rawTitle.slice(0, MAX_SHARED_TEXT_LENGTH)
        : "";
  const combinedText = [text, sharedUrl].filter(Boolean).join(" ").trim().slice(0, MAX_SHARED_TEXT_LENGTH);

  const url = new URL("/import", req.url);
  if (combinedText) url.searchParams.set("text", combinedText);

  return NextResponse.redirect(url, 303);
}
