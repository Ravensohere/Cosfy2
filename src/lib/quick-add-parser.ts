import { CATEGORIES, PAYMENT_MODES } from "@/lib/constants";

const FOOD_KEYWORDS = ["swiggy", "zomato", "chai", "coffee", "lunch", "dinner", "breakfast", "restaurant", "food", "cafe"];
const TRANSPORT_KEYWORDS = ["uber", "ola", "petrol", "diesel", "fuel", "metro", "bus", "auto", "cab", "train"];
const SHOPPING_KEYWORDS = ["amazon", "flipkart", "myntra", "mall", "shopping", "clothes"];
const HOME_KEYWORDS = ["rent", "electricity", "wifi", "internet", "grocery", "groceries", "milk", "maid"];
const HEALTH_KEYWORDS = ["medicine", "pharmacy", "doctor", "hospital", "gym"];
const ENTERTAINMENT_KEYWORDS = ["movie", "netflix", "hotstar", "spotify", "concert", "game"];
const INCOME_KEYWORDS = ["salary", "income", "credited", "refund", "cashback"];

export function guessCategory(text: string): (typeof CATEGORIES)[number] {
  const lower = text.toLowerCase();
  if (INCOME_KEYWORDS.some((k) => lower.includes(k))) return "Income";
  if (FOOD_KEYWORDS.some((k) => lower.includes(k))) return "Food";
  if (TRANSPORT_KEYWORDS.some((k) => lower.includes(k))) return "Transport";
  if (SHOPPING_KEYWORDS.some((k) => lower.includes(k))) return "Shopping";
  if (HOME_KEYWORDS.some((k) => lower.includes(k))) return "Home";
  if (HEALTH_KEYWORDS.some((k) => lower.includes(k))) return "Health";
  if (ENTERTAINMENT_KEYWORDS.some((k) => lower.includes(k))) return "Entertainment";
  return "Other";
}

export function guessPaymentMode(text: string): (typeof PAYMENT_MODES)[number] {
  const lower = text.toLowerCase();
  if (lower.includes("cash")) return "Cash";
  if (lower.includes("card")) return "Card";
  return "UPI";
}

export function parseQuickAdd(text: string) {
  const amountMatch = text.match(/(\d+(\.\d+)?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
  const description = text
    .replace(/(\d+(\.\d+)?)/, "")
    .replace(/\b(cash|card|upi)\b/gi, "")
    .trim();

  return {
    amount,
    description: description || "Expense",
    category: guessCategory(text),
    paymentMode: guessPaymentMode(text),
  };
}
