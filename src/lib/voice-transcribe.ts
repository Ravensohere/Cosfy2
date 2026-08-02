export async function transcribeAudio(apiKey: string, file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("model", "whisper-1");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return typeof data?.text === "string" ? data.text : "";
}
