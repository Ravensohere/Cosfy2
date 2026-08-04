import { callGeminiJSON } from "@/lib/gemini";

export type VisionExpense = {
  amount: number;
  merchant: string;
  isCredit: boolean;
};

const PROMPT =
  'Extract the transaction from this payment notification, invoice, or receipt screenshot. Respond with strict JSON only: {"amount": number, "merchant": string, "isCredit": boolean}. amount is 0 if none is visible. isCredit is true only for money received (refund, salary, deposit).';

export async function extractExpenseFromImage(apiKey: string, dataUrl: string): Promise<VisionExpense> {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return { amount: 0, merchant: "Screenshot transaction", isCredit: false };
  const [, mimeType, base64Data] = match;

  const content = await callGeminiJSON({ apiKey, prompt: PROMPT, mimeType, base64Data });

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
