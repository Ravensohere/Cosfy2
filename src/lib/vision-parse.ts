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

export type VisionBillItem = { name: string; quantity: number; price: number };
export type VisionBill = {
  merchant: string;
  date: string | null;
  items: VisionBillItem[];
  taxAndCharges: number;
};

const BILL_PROMPT =
  'Extract every line item from this restaurant or shop bill/receipt photo. Respond with strict JSON only: ' +
  '{"merchant": string, "date": string | null, "items": [{"name": string, "quantity": number, "price": number}], "taxAndCharges": number}. ' +
  '"date" is YYYY-MM-DD if visible, else null. For each item, "price" is the PER-UNIT price such that quantity * price equals that line\'s subtotal on the receipt. ' +
  '"taxAndCharges" is the grand total minus the sum of all item subtotals (tax, service charge, delivery, tip, minus any discount as a negative number). ' +
  "If the image isn't a bill or nothing is legible, return empty items.";

export async function extractBillFromImage(apiKey: string, dataUrl: string): Promise<VisionBill> {
  const empty: VisionBill = { merchant: "", date: null, items: [], taxAndCharges: 0 };
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return empty;
  const [, mimeType, base64Data] = match;

  const content = await callGeminiJSON({ apiKey, prompt: BILL_PROMPT, mimeType, base64Data });

  try {
    const parsed = JSON.parse(content);
    const items: VisionBillItem[] = Array.isArray(parsed.items)
      ? parsed.items
          .filter((i: unknown): i is Record<string, unknown> => typeof i === "object" && i !== null)
          .map((i: Record<string, unknown>) => ({
            name: typeof i.name === "string" && i.name.trim() ? i.name.trim() : "Item",
            quantity: typeof i.quantity === "number" && i.quantity > 0 ? i.quantity : 1,
            price: typeof i.price === "number" && i.price >= 0 ? i.price : 0,
          }))
      : [];

    return {
      merchant: typeof parsed.merchant === "string" ? parsed.merchant : "",
      date: typeof parsed.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) ? parsed.date : null,
      items,
      taxAndCharges: typeof parsed.taxAndCharges === "number" ? parsed.taxAndCharges : 0,
    };
  } catch {
    return empty;
  }
}

export type VisionTransaction = { description: string; amount: number; isCredit: boolean };

const TRANSACTIONS_PROMPT =
  "Extract every distinct expense or income entry visible in this image. It may be a single receipt/bill with line items, " +
  "a screenshot of a payment notification, or a screenshot listing multiple payment/transaction records (bank, UPI, or wallet app history). " +
  'Respond with strict JSON only: {"transactions": [{"description": string, "amount": number, "isCredit": boolean}]}. ' +
  "For a receipt or bill, each line item is its own transaction and its price is the amount. " +
  "For a list of transaction records, each row is its own transaction with its own amount. " +
  "isCredit is true only for money received (refund, salary, deposit, credit); false for money spent. " +
  "If the image isn't legible or has no transactions, return an empty array.";

export async function extractTransactionsFromImage(apiKey: string, dataUrl: string): Promise<VisionTransaction[]> {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return [];
  const [, mimeType, base64Data] = match;

  const content = await callGeminiJSON({ apiKey, prompt: TRANSACTIONS_PROMPT, mimeType, base64Data });

  try {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed.transactions)) return [];
    return parsed.transactions
      .filter((t: unknown): t is Record<string, unknown> => typeof t === "object" && t !== null)
      .map((t: Record<string, unknown>) => ({
        description: typeof t.description === "string" && t.description.trim() ? t.description.trim() : "Transaction",
        amount: typeof t.amount === "number" && t.amount > 0 ? t.amount : 0,
        isCredit: Boolean(t.isCredit),
      }))
      .filter((t: VisionTransaction) => t.amount > 0);
  } catch {
    return [];
  }
}

export type VisionCoupon = {
  title: string;
  merchant: string;
  code: string;
  description: string;
  expiresAt: string | null;
};

const COUPON_PROMPT =
  'Extract the offer from this coupon, promo code, or discount voucher photo/screenshot. Respond with strict JSON only: ' +
  '{"title": string, "merchant": string, "code": string, "description": string, "expiresAt": string | null}. ' +
  '"title" is a short summary like "20% off first order" or "Free delivery". "merchant" is the brand or store name, empty string if unclear. ' +
  '"code" is the promo/coupon code to enter at checkout, empty string if none (auto-applied offers have no code). ' +
  '"description" is any terms shown (min order value, category, etc.), empty string if none. "expiresAt" is YYYY-MM-DD if a valid-until date is visible, else null.';

export async function extractCouponFromImage(apiKey: string, dataUrl: string): Promise<VisionCoupon> {
  const empty: VisionCoupon = { title: "", merchant: "", code: "", description: "", expiresAt: null };
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return empty;
  const [, mimeType, base64Data] = match;

  const content = await callGeminiJSON({ apiKey, prompt: COUPON_PROMPT, mimeType, base64Data });

  try {
    const parsed = JSON.parse(content);
    return {
      title: typeof parsed.title === "string" ? parsed.title : "",
      merchant: typeof parsed.merchant === "string" ? parsed.merchant : "",
      code: typeof parsed.code === "string" ? parsed.code : "",
      description: typeof parsed.description === "string" ? parsed.description : "",
      expiresAt: typeof parsed.expiresAt === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.expiresAt) ? parsed.expiresAt : null,
    };
  } catch {
    return empty;
  }
}
