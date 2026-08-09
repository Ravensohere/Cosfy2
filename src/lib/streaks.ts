type TransactionLike = { date: Date; amount: number };

function toDayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function daysBack(from: Date, n: number): Date {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return d;
}

/** Consecutive days ending today with zero expense transactions logged. */
export function computeNoSpendStreak(transactions: TransactionLike[], today: Date = new Date()): number {
  const spendDays = new Set(transactions.filter((t) => t.amount < 0).map((t) => toDayKey(t.date)));

  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const day = daysBack(today, i);
    if (spendDays.has(toDayKey(day))) break;
    streak++;
  }
  return streak;
}

/** Consecutive days ending today with at least one transaction logged (engagement habit). */
export function computeLoggingStreak(transactions: TransactionLike[], today: Date = new Date()): number {
  const loggedDays = new Set(transactions.map((t) => toDayKey(t.date)));

  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const day = daysBack(today, i);
    if (!loggedDays.has(toDayKey(day))) break;
    streak++;
  }
  return streak;
}
