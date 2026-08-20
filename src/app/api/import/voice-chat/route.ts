import { NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/voice-transcribe";
import { getCurrentUser } from "@/lib/current-user";
import { validateUpload } from "@/lib/validate-upload";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Voice input isn't set up yet. Set GEMINI_API_KEY on the server." },
      { status: 503 }
    );
  }

  const user = await getCurrentUser();
  const rl = await checkRateLimit("import-voice-chat", user.id, { requests: 20, windowSeconds: 60 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests, try again shortly." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No audio uploaded." }, { status: 400 });
  }

  const validation = validateUpload(file, "audio");
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const transcript = await transcribeAudio(apiKey, file);
    if (!transcript.trim()) {
      return NextResponse.json({ error: "Couldn't hear anything, try again." }, { status: 422 });
    }
    return NextResponse.json({ transcript });
  } catch (err) {
    console.error("[import/voice-chat]", err);
    return NextResponse.json({ error: "Couldn't transcribe that. Try again or type it manually." }, { status: 502 });
  }
}
