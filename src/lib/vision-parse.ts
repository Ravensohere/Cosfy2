import { friendlyOpenAIError } from "@/lib/openai-error";

export type VisionExpense = {
  amount: number;
  merchant: string;
  isCredit: boolean;
};

export async function extractExpenseFromImage(apiKey: string, dataUrl: string): Promise<VisionExpense> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'Extract the transaction from a payment notification, invoice, or receipt screenshot. Respond with strict JSON only: {"amount": number, "merchant": string, "isCredit": boolean}. amount is 0 if none is visible. isCredit is true only for money received (refund, salary, deposit).',
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Extract the transaction from this image." },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      max_tokens: 200,
    }),
  });

  if (!res.ok) throw new Error(await friendlyOpenAIError(res));
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? "{}";

  try {
    const parsed = JSON.parse(content);
    return {
      amount: typeof parsed.amount === "number" ? parsed.amount : 0,
      merchant: typeof parsed.merchant === "string" ? parsed.merchant : "Screenshot transaction",
      isCredit: Boolean(parsed.isCredit),
    };
  } catch {
    return { amount: 0, merchant: "Screenshot transaction", isCredit: false };
  }
}
