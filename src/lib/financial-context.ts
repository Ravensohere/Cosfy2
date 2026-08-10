import { db } from "@/lib/db";
import { formatINR } from "@/lib/format";
import { getNetWorthBreakdown } from "@/lib/actions/net-worth";
import { getAverageMonthlySurplus } from "@/lib/actions/goals";
import { nextDueDate, daysUntil, dueUrgency } from "@/lib/credit-card-status";

export type FinancialContext = {
  spentThisMonth: number;
  spentLastMonth: number;
  categoryThisMonth: Record<string, number>;
  categoryLastMonth: Record<string, number>;
  averageMonthlySurplus: number | null;
  netWorth: Awaited<ReturnType<typeof getNetWorthBreakdown>>;
  budgets: { label: string; spent: number; limit: number; alertThreshold: number }[];
  goals: { name: string; targetAmount: number; saved: number; targetDate: Date | null }[];
  creditCards: { name: string; due: number; urgency: string; daysUntilDue: number }[];
  subscriptions: { name: string; amount: number; cycle: string }[];
  insurancePolicies: { policyName: string; type: string; premiumAmount: number }[];
  hasEnoughData: boolean;
};

export async function buildFinancialContext(userId: string): Promise<FinancialContext> {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [expenseTx, netWorth, averageMonthlySurplus, budgetRows, goalRows, creditCards, subscriptions, insurancePolicies, txCount] =
    await Promise.all([
      db.transaction.findMany({ where: { userId, amount: { lt: 0 }, date: { gte: lastMonthStart } } }),
      getNetWorthBreakdown(userId),
      getAverageMonthlySurplus(userId),
      db.budget.findMany({ where: { userId, OR: [{ endDate: null }, { endDate: { gte: now } }] } }),
      db.goal.findMany({ where: { userId }, include: { contributions: true } }),
      db.creditCard.findMany({ where: { userId } }),
      db.subscription.findMany({ where: { userId, isActive: true } }),
      db.insurancePolicy.findMany({ where: { userId } }),
      db.transaction.count({ where: { userId } }),
    ]);

  const categoryThisMonth: Record<string, number> = {};
  const categoryLastMonth: Record<string, number> = {};
  for (const t of expenseTx) {
    const bucket = t.date >= thisMonthStart ? categoryThisMonth : categoryLastMonth;
    bucket[t.category] = (bucket[t.category] ?? 0) + Math.abs(t.amount);
  }
  const spentThisMonth = Object.values(categoryThisMonth).reduce((s, v) => s + v, 0);
  const spentLastMonth = Object.values(categoryLastMonth).reduce((s, v) => s + v, 0);

  const budgets = await Promise.all(
    budgetRows.map(async (b) => {
      const rows = await db.transaction.findMany({
        where: {
          userId,
          amount: { lt: 0 },
          date: { gte: thisMonthStart },
          ...(b.type === "Category" ? { category: b.category ?? undefined } : {}),
        },
      });
      return {
        label: b.type === "Category" ? b.category ?? "Category" : `${b.type} budget`,
        spent: rows.reduce((s, t) => s + Math.abs(t.amount), 0),
        limit: b.amount,
        alertThreshold: b.alertThreshold,
      };
    })
  );

  const goals = goalRows.map((g) => ({
    name: g.name,
    targetAmount: g.targetAmount,
    saved: g.contributions.reduce((s, c) => s + c.amount, 0),
    targetDate: g.targetDate,
  }));

  const creditCardStatus = creditCards.map((c) => {
    const due = nextDueDate(c.dueDay);
    const days = daysUntil(due);
    return { name: c.name, due: c.currentDue, urgency: dueUrgency(days, c.currentDue), daysUntilDue: days };
  });

  return {
    spentThisMonth,
    spentLastMonth,
    categoryThisMonth,
    categoryLastMonth,
    averageMonthlySurplus,
    netWorth,
    budgets,
    goals,
    creditCards: creditCardStatus,
    subscriptions: subscriptions.map((s) => ({ name: s.name, amount: s.amount, cycle: s.cycle })),
    insurancePolicies: insurancePolicies.map((p) => ({ policyName: p.policyName, type: p.type, premiumAmount: p.premiumAmount })),
    hasEnoughData: txCount >= 5,
  };
}

export function toPromptSummary(ctx: FinancialContext): string {
  const lines: string[] = [];
  lines.push(`Spent this month: ${formatINR(ctx.spentThisMonth)} (last month: ${formatINR(ctx.spentLastMonth)}).`);

  if (ctx.averageMonthlySurplus !== null) {
    lines.push(`Average monthly surplus (income minus spend): ${formatINR(ctx.averageMonthlySurplus)}.`);
  }

  const topCategories = Object.entries(ctx.categoryThisMonth)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, amt]) => `${cat}: ${formatINR(amt)}`)
    .join(", ");
  if (topCategories) lines.push(`Top categories this month: ${topCategories}.`);

  lines.push(
    `Net worth: ${formatINR(ctx.netWorth.netWorth)} (assets ${formatINR(ctx.netWorth.totalAssets)}, liabilities ${formatINR(ctx.netWorth.totalLiabilities)}).`
  );

  if (ctx.budgets.length > 0) {
    const overspend = ctx.budgets
      .filter((b) => b.limit > 0 && b.spent / b.limit >= b.alertThreshold / 100)
      .map((b) => `${b.label} ${formatINR(b.spent)}/${formatINR(b.limit)}`);
    if (overspend.length > 0) lines.push(`Budgets near or over limit: ${overspend.join(", ")}.`);
  }

  if (ctx.goals.length > 0) {
    lines.push(`Goals: ${ctx.goals.map((g) => `${g.name} ${formatINR(g.saved)}/${formatINR(g.targetAmount)}`).join(", ")}.`);
  }

  const duesSoon = ctx.creditCards.filter((c) => c.urgency === "soon" || c.urgency === "overdue");
  if (duesSoon.length > 0) {
    lines.push(
      `Credit card dues needing attention: ${duesSoon.map((c) => `${c.name} ${formatINR(c.due)} (${c.urgency})`).join(", ")}.`
    );
  }

  if (ctx.subscriptions.length > 0) {
    lines.push(`Active subscriptions: ${ctx.subscriptions.map((s) => `${s.name} ${formatINR(s.amount)}/${s.cycle}`).join(", ")}.`);
  }

  if (!ctx.hasEnoughData) {
    lines.push("Note: this user has very little transaction history so far, keep advice general and say so if asked for specifics.");
  }

  return lines.join("\n");
}
