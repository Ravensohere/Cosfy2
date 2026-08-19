/** Bank-brand-ish gradients for the card visual. Approximate, not official brand colors. */
const BANK_THEMES: { match: RegExp; gradient: string; text: string }[] = [
  { match: /hdfc/i, gradient: "linear-gradient(135deg, #08213a 0%, #123a63 55%, #1c5490 100%)", text: "#ffffff" },
  { match: /icici/i, gradient: "linear-gradient(135deg, #7a1315 0%, #b8342c 55%, #e8623a 100%)", text: "#ffffff" },
  { match: /\bsbi\b|state bank/i, gradient: "linear-gradient(135deg, #0b2e6b 0%, #1a4fa0 55%, #2f7bd6 100%)", text: "#ffffff" },
  { match: /axis/i, gradient: "linear-gradient(135deg, #5c0f1e 0%, #8a1c2f 55%, #b23347 100%)", text: "#ffffff" },
  { match: /kotak/i, gradient: "linear-gradient(135deg, #4a0b12 0%, #7d1420 55%, #a8202f 100%)", text: "#ffffff" },
  { match: /idfc/i, gradient: "linear-gradient(135deg, #6e0d1a 0%, #9c1826 55%, #c92c3c 100%)", text: "#ffffff" },
  { match: /\byes bank\b/i, gradient: "linear-gradient(135deg, #051c40 0%, #0c3a75 55%, #1861b8 100%)", text: "#ffffff" },
  { match: /rbl/i, gradient: "linear-gradient(135deg, #3a0d3f 0%, #5f1863 55%, #8a2a8f 100%)", text: "#ffffff" },
  { match: /indusind/i, gradient: "linear-gradient(135deg, #4a0e12 0%, #7a1a1f 55%, #a92830 100%)", text: "#ffffff" },
  { match: /citi/i, gradient: "linear-gradient(135deg, #001a52 0%, #0a3d91 55%, #0d5ed6 100%)", text: "#ffffff" },
  { match: /amex|american express/i, gradient: "linear-gradient(135deg, #002b28 0%, #0d5c50 55%, #1a9385 100%)", text: "#ffffff" },
  { match: /standard chartered|\bscb\b/i, gradient: "linear-gradient(135deg, #052e1a 0%, #0d5c30 55%, #158a49 100%)", text: "#ffffff" },
  { match: /hsbc/i, gradient: "linear-gradient(135deg, #4a0505 0%, #7a0d0d 55%, #b31414 100%)", text: "#ffffff" },
];

const DEFAULT_THEME = { gradient: "linear-gradient(135deg, #1a1c16 0%, #2b2e22 55%, #3d4230 100%)", text: "#ffffff" };

export function cardTheme(bank: string | null | undefined) {
  if (!bank) return DEFAULT_THEME;
  const found = BANK_THEMES.find((t) => t.match.test(bank));
  return found ?? DEFAULT_THEME;
}

export const CARD_NETWORKS = ["Visa", "Mastercard", "RuPay", "Amex", "Other"] as const;
export type CardNetwork = (typeof CARD_NETWORKS)[number];
