export async function friendlyOpenAIError(res: Response): Promise<string> {
  const raw = await res.text().catch(() => "");
  let code: string | undefined;
  let message: string | undefined;

  try {
    const parsed = JSON.parse(raw);
    code = parsed?.error?.code;
    message = parsed?.error?.message;
  } catch {
    // not JSON, fall through to generic handling
  }

  if (res.status === 401 || code === "invalid_api_key") {
    return "That OpenAI API key looks invalid or revoked. Check it in Profile → OpenAI API key.";
  }
  if (code === "insufficient_quota") {
    return "Your OpenAI account is out of quota. Add billing/credits at platform.openai.com/account/billing, then try again.";
  }
  if (res.status === 429) {
    return "OpenAI is rate-limiting this key right now — wait a moment and try again.";
  }

  return `OpenAI request failed: ${(message ?? raw).slice(0, 200)}`;
}
