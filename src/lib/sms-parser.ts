import { guessCategory, guessPaymentMode } from "@/lib/quick-add-parser";
import type { CategoryValue, PaymentModeValue } from "@/lib/constants";

const AMOUNT_RE = /(?:rs\.?|inr|₹)\s?([\d,]+(?:\.\d{1,2})?)/i;
const CREDIT_KEYWORDS = ["credited", "received", "refund", "cashback", "credit of", "deposited"];
const DEBIT_KEYWORDS = ["debited", "spent", "paid", "purchase", "withdrawn", "debit of"];
const MERCHANT_RE = /(?:at|to|towards|on)\s+([A-Za-z0-9&.\-\s]{3,30}?)(?:\s+on\b|\s+via\b|\s+ref\b|\.|,|$)/i;

export type ParsedSms = {
  amount: number;
  isCredit: boolean;
  merchant: string;
  category: CategoryValue;
  paymentMode: PaymentModeValue;
};

export function parseSms(text: string): ParsedSms | null {
  const amountMatch = text.match(AMOUNT_RE);
  if (!amountMatch) return null;

  const amount = parseFloat(amountMatch[1].replace(/,/g, ""));
  if (!amount || amount <= 0) return null;

  const lower = text.toLowerCase();
  const isCredit =
    CREDIT_KEYWORDS.some((k) => lower.includes(k)) && !DEBIT_KEYWORDS.some((k) => lower.includes(k));

  const merchantMatch = text.match(MERCHANT_RE);
  const merchant = merchantMatch ? merchantMatch[1].trim() : "SMS transaction";

  return {
    amount,
    isCredit,
    merchant,
    category: isCredit ? "Income" : guessCategory(text),
    paymentMode: guessPaymentMode(text),
  };
}
