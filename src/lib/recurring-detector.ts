export type RecurringSuggestion = {
  description: string;
  category: string;
  amount: number;
  occurrences: number;
  lastDate: Date;
  nextRenewalDate: Date;
};

type TransactionLike = { description: string; category: string; amount: number; date: Date };

export function detectRecurringTransactions(
  transactions: TransactionLike[],
  existingNames: string[]
): RecurringSuggestion[] {
  const excluded = new Set(existingNames.map((n) => n.trim().toLowerCase()));
  const groups = new Map<string, TransactionLike[]>();

  for (const t of transactions) {
    if (t.amount >= 0) continue; // only expenses can be subscriptions
    const key = `${t.description.trim().toLowerCase()}|${t.category}`;
    const group = groups.get(key);
    if (group) group.push(t);
    else groups.set(key, [t]);
  }

  const suggestions: RecurringSuggestion[] = [];

  for (const [key, group] of groups) {
    const normalizedName = key.split("|")[0];
    if (excluded.has(normalizedName) || group.length < 2) continue;

    const sorted = [...group].sort((a, b) => a.date.getTime() - b.date.getTime());
    const gaps: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      gaps.push((sorted[i].date.getTime() - sorted[i - 1].date.getTime()) / 86_400_000);
    }
    const looksMonthly = gaps.every((g) => g >= 20 && g <= 40);
    if (!looksMonthly) continue;

    const amounts = sorted.map((t) => Math.abs(t.amount));
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const maxDeviation = Math.max(...amounts.map((a) => Math.abs(a - avgAmount)));
    if (avgAmount === 0 || maxDeviation / avgAmount > 0.15) continue;

    const last = sorted[sorted.length - 1];
    const nextRenewalDate = new Date(last.date);
    nextRenewalDate.setDate(nextRenewalDate.getDate() + 30);

    suggestions.push({
      description: last.description.trim(),
      category: last.category,
      amount: Math.round(avgAmount * 100) / 100,
      occurrences: sorted.length,
      lastDate: last.date,
      nextRenewalDate,
    });
  }

  return suggestions.sort((a, b) => b.occurrences - a.occurrences);
}
