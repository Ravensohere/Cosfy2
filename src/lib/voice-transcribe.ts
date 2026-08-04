import { callGeminiTranscribe } from "@/lib/gemini";

export async function transcribeAudio(apiKey: string, file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString("base64");
  const mimeType = file.type || "audio/webm";

  return callGeminiTranscribe({ apiKey, mimeType, base64Data });
}
