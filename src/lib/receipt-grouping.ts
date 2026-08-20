import type { Transaction } from "@prisma/client";

export type TransactionListItem =
  | { type: "single"; transaction: Transaction }
  | { type: "receipt"; receiptId: string; merchant: string; total: number; date: Date; transactions: Transaction[] };

/**
 * Buckets a date-sorted transaction list so every transaction sharing a
 * receiptId renders as one group instead of N disconnected rows. Order is
 * preserved by each group's first occurrence.
 */
export function groupTransactionsByReceipt(
  transactions: Transaction[],
  receipts: Map<string, { merchant: string; total: number }>
): TransactionListItem[] {
  const items: TransactionListItem[] = [];
  const seen = new Map<string, number>(); // receiptId -> index into items

  for (const t of transactions) {
    if (t.receiptId && receipts.has(t.receiptId)) {
      const receipt = receipts.get(t.receiptId)!;
      const existingIndex = seen.get(t.receiptId);
      if (existingIndex !== undefined) {
        const group = items[existingIndex];
        if (group.type === "receipt") group.transactions.push(t);
        continue;
      }
      seen.set(t.receiptId, items.length);
      items.push({
        type: "receipt",
        receiptId: t.receiptId,
        merchant: receipt.merchant,
        total: receipt.total,
        date: t.date,
        transactions: [t],
      });
    } else {
      items.push({ type: "single", transaction: t });
    }
  }

  return items;
}
