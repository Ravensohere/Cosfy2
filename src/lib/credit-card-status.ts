export function nextDueDate(dueDay: number, from: Date = new Date()): Date {
  const clampedDay = Math.min(dueDay, 28);
  const thisMonth = new Date(from.getFullYear(), from.getMonth(), clampedDay);
  if (thisMonth >= startOfDay(from)) return thisMonth;
  return new Date(from.getFullYear(), from.getMonth() + 1, clampedDay);
}

export function daysUntil(date: Date, from: Date = new Date()): number {
  const ms = startOfDay(date).getTime() - startOfDay(from).getTime();
  return Math.round(ms / 86_400_000);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export type DueUrgency = "overdue" | "soon" | "upcoming" | "paid";

export function dueUrgency(daysLeft: number, amountDue: number): DueUrgency {
  if (amountDue <= 0) return "paid";
  if (daysLeft < 0) return "overdue";
  if (daysLeft <= 3) return "soon";
  return "upcoming";
}
