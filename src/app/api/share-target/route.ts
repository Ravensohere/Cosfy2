import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData().catch(() => null);
  const text = (formData?.get("text") || formData?.get("title") || "").toString();

  const url = new URL("/import", req.url);
  if (text) url.searchParams.set("text", text);

  return NextResponse.redirect(url, 303);
}
