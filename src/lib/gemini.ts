const GEMINI_MODEL = "gemini-2.0-flash";

export async function callGemini({
  apiKey,
  systemPrompt,
  messages,
}: {
  apiKey: string;
  systemPrompt: string;
  messages: { role: "user" | "assistant"; content: string }[];
}) {
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(await friendlyGeminiError(res));
  }

  const data = await res.json();
  const reply: string =
    data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ??
    "Sorry, I couldn't generate a reply.";

  return reply;
}

async function friendlyGeminiError(res: Response): Promise<string> {
  const raw = await res.text().catch(() => "");
  let message: string | undefined;
  let status: string | undefined;

  try {
    const parsed = JSON.parse(raw);
    message = parsed?.error?.message;
    status = parsed?.error?.status;
  } catch {
    // not JSON, fall through to generic handling
  }

  if (res.status === 400 && status === "INVALID_ARGUMENT") {
    return "The Gemini API key looks invalid. Check GEMINI_API_KEY on the server.";
  }
  if (res.status === 403) {
    return "Gemini API key is missing permission for this model. Check it at aistudio.google.com/apikey.";
  }
  if (res.status === 429) {
    return "Gemini is rate-limiting requests right now — wait a moment and try again.";
  }

  return `Gemini request failed: ${(message ?? raw).slice(0, 200)}`;
}
