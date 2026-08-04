const GEMINI_MODEL = "gemini-flash-latest";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

type GeminiPart = { text: string } | { inlineData: { mimeType: string; data: string } };

async function generate(apiKey: string, body: Record<string, unknown>) {
  const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(await friendlyGeminiError(res));
  }

  return res.json();
}

function extractText(data: {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}): string {
  return data?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
}

export async function callGemini({
  apiKey,
  systemPrompt,
  messages,
}: {
  apiKey: string;
  systemPrompt: string;
  messages: { role: "user" | "assistant"; content: string }[];
}): Promise<string> {
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const data = await generate(apiKey, {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
  });

  return extractText(data) || "Sorry, I couldn't generate a reply.";
}

export async function callGeminiJSON({
  apiKey,
  prompt,
  mimeType,
  base64Data,
}: {
  apiKey: string;
  prompt: string;
  mimeType: string;
  base64Data: string;
}): Promise<string> {
  const parts: GeminiPart[] = [{ text: prompt }, { inlineData: { mimeType, data: base64Data } }];

  const data = await generate(apiKey, {
    contents: [{ role: "user", parts }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 200, responseMimeType: "application/json" },
  });

  return extractText(data) || "{}";
}

export async function callGeminiTranscribe({
  apiKey,
  mimeType,
  base64Data,
}: {
  apiKey: string;
  mimeType: string;
  base64Data: string;
}): Promise<string> {
  const parts: GeminiPart[] = [
    { text: "Transcribe this audio verbatim. Respond with only the transcript text, nothing else." },
    { inlineData: { mimeType, data: base64Data } },
  ];

  const data = await generate(apiKey, {
    contents: [{ role: "user", parts }],
    generationConfig: { temperature: 0, maxOutputTokens: 200 },
  });

  return extractText(data);
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
