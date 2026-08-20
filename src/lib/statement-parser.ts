import { guessCategory, guessPaymentMode } from "@/lib/quick-add-parser";
import type { CategoryValue, PaymentModeValue } from "@/lib/constants";

export type StatementRow = {
  date: string | null;
  description: string;
  amount: number;
  category: CategoryValue;
  paymentMode: PaymentModeValue;
};

const MAX_ROWS = 200;

function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[₹,\s]/g, "");
  const value = parseFloat(cleaned);
  return Number.isFinite(value) ? value : 0;
}

function normalizeDate(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();

  const dmy = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (dmy) {
    const [, d, m, y] = dmy;
    const year = y.length === 2 ? `20${y}` : y;
    const date = new Date(`${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  return null;
}

export function parseCsvStatement(csv: string): StatementRow[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const dateIdx = header.findIndex((h) => h.includes("date"));
  const descIdx = header.findIndex((h) => h.includes("narration") || h.includes("description") || h.includes("particulars") || h.includes("detail"));
  const debitIdx = header.findIndex((h) => h.includes("debit") || h.includes("withdrawal"));
  const creditIdx = header.findIndex((h) => h.includes("credit") || h.includes("deposit"));
  const amountIdx = header.findIndex((h) => h.includes("amount"));
  // Many exports (e.g. card statements) use one signed/unsigned "Amount"
  // column plus a separate Dr/Cr or Debit/Credit indicator column, rather
  // than splitting into two amount columns — without this, every row falls
  // through as a bare positive number and gets miscategorized as Income.
  const typeIdx = header.findIndex((h) => h.includes("type") || h.includes("dr/cr") || h === "dr" || h === "cr");

  const rows: StatementRow[] = [];

  for (const line of lines.slice(1)) {
    if (rows.length >= MAX_ROWS) break;
    const fields = splitCsvLine(line);

    const description = descIdx >= 0 ? fields[descIdx] : fields.filter((_, i) => i !== dateIdx).join(" ");
    if (!description) continue;

    let amount = 0;
    if (debitIdx >= 0 && fields[debitIdx] && parseAmount(fields[debitIdx]) > 0) {
      amount = -parseAmount(fields[debitIdx]);
    } else if (creditIdx >= 0 && fields[creditIdx] && parseAmount(fields[creditIdx]) > 0) {
      amount = parseAmount(fields[creditIdx]);
    } else if (amountIdx >= 0) {
      const raw = parseAmount(fields[amountIdx]);
      const typeVal = typeIdx >= 0 ? fields[typeIdx]?.toLowerCase() ?? "" : "";
      if (/\b(debit|dr|withdrawal)\b/.test(typeVal)) amount = -Math.abs(raw);
      else if (/\b(credit|cr|deposit)\b/.test(typeVal)) amount = Math.abs(raw);
      else amount = raw;
    }
    if (!amount) continue;

    rows.push({
      date: dateIdx >= 0 ? normalizeDate(fields[dateIdx]) : null,
      description,
      amount,
      category: amount > 0 ? "Income" : guessCategory(description),
      paymentMode: guessPaymentMode(description),
    });
  }

  return rows;
}

const LINE_DATE_RE = /^(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/;
const LINE_AMOUNT_RE = /(?:rs\.?|inr|₹)?\s?([\d,]+\.\d{2})/i;
const CREDIT_HINT_RE = /\b(cr|credit)\b/i;
const DEBIT_HINT_RE = /\b(dr|debit)\b/i;

export function parsePdfStatement(text: string): StatementRow[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const rows: StatementRow[] = [];

  for (const line of lines) {
    if (rows.length >= MAX_ROWS) break;
    const dateMatch = line.match(LINE_DATE_RE);
    if (!dateMatch) continue;

    const amountMatches = [...line.matchAll(new RegExp(LINE_AMOUNT_RE, "gi"))];
    if (amountMatches.length === 0) continue;

    const amountValue = parseAmount(amountMatches[0][1]);
    if (!amountValue) continue;

    const isCredit = CREDIT_HINT_RE.test(line) && !DEBIT_HINT_RE.test(line);
    const description = line
      .replace(LINE_DATE_RE, "")
      .replace(new RegExp(LINE_AMOUNT_RE, "gi"), "")
      .replace(/\b(dr|cr|debit|credit)\b/gi, "")
      .trim()
      .slice(0, 60) || "Statement entry";

    rows.push({
      date: normalizeDate(dateMatch[1]),
      description,
      amount: isCredit ? amountValue : -amountValue,
      category: isCredit ? "Income" : guessCategory(description),
      paymentMode: guessPaymentMode(description),
    });
  }

  return rows;
}
