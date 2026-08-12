type TransactionAmount = { amount: number };

/** Income (positive amounts) vs spend (absolute value of negative amounts) for a set of transactions. */
export function computeIncomeAndSpent(transactions: TransactionAmount[]) {
  const income = transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const spent = transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  return { income, spent, surplus: income - spent };
}
