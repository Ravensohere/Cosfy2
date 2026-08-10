import { notFound } from "next/navigation";
import { TrendingDown, TrendingUp } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { HeroCard } from "@/components/ui/HeroCard";
import { StatCard } from "@/components/ui/StatCard";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { IconTile } from "@/components/ui/IconTile";
import { ReportCoachTake } from "@/components/reports/ReportCoachTake";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/format";

const SMALL_SPEND_THRESHOLD = 200;
const SMALL_SPEND_MIN_COUNT = 5;
const LEAK_DELTA_THRESHOLD = 300;

export default async function MonthlyReportPage({ params }: { params: Promise<{ yearMonth: string }> }) {
  const { yearMonth } = await params;
  if (!/^\d{4}-\d{2}$/.test(yearMonth)) notFound();
  const [year, month] = yearMonth.split("-").map(Number);

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 1);
  const prevMonthStart = new Date(year, month - 2, 1);

  const user = await getCurrentUser();

  const [transactions, prevTransactions, budgets, goalContributions] = await Promise.all([
    db.transaction.findMany({ where: { userId: user.id, date: { gte: monthStart, lt: monthEnd } } }),
    db.transaction.findMany({ where: { userId: user.id, date: { gte: prevMonthStart, lt: monthStart } } }),
    db.budget.findMany({ where: { userId: user.id, OR: [{ endDate: null }, { endDate: { gte: monthStart } }] } }),
    db.goalContribution.findMany({
      where: { createdAt: { gte: monthStart, lt: monthEnd }, goal: { userId: user.id } },
      include: { goal: true },
    }),
  ]);

  const income = transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const spent = transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const surplus = income - spent;

  const categoryThisMonth: Record<string, number> = {};
  const categoryPrevMonth: Record<string, number> = {};
  for (const t of transactions.filter((t) => t.amount < 0)) {
    categoryThisMonth[t.category] = (categoryThisMonth[t.category] ?? 0) + Math.abs(t.amount);
  }
  for (const t of prevTransactions.filter((t) => t.amount < 0)) {
    categoryPrevMonth[t.category] = (categoryPrevMonth[t.category] ?? 0) + Math.abs(t.amount);
  }

  const categories = Array.from(new Set([...Object.keys(categoryThisMonth), ...Object.keys(categoryPrevMonth)]));
  const deltas = categories
    .map((c) => ({ category: c, delta: (categoryThisMonth[c] ?? 0) - (categoryPrevMonth[c] ?? 0) }))
    .sort((a, b) => b.delta - a.delta);

  const increases = deltas.filter((d) => d.delta >= LEAK_DELTA_THRESHOLD).slice(0, 3);
  const decreases = deltas
    .filter((d) => d.delta <= -LEAK_DELTA_THRESHOLD)
    .sort((a, b) => a.delta - b.delta)
    .slice(0, 2);

  const smallSpends = transactions.filter((t) => t.amount < 0 && Math.abs(t.amount) < SMALL_SPEND_THRESHOLD);
  const smallSpendTotal = smallSpends.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const budgetsWithSpend = budgets.map((b) => {
    const spentOnBudget = transactions
      .filter((t) => t.amount < 0 && (b.type !== "Category" || t.category === b.category))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return { budget: b, spentOnBudget, over: b.amount > 0 && spentOnBudget > b.amount };
  });
  const overBudgets = budgetsWithSpend.filter((b) => b.over);
  const disciplinedBudgets = budgetsWithSpend.filter((b) => !b.over);

  const leaks: string[] = [
    ...increases.map((d) => `${d.category} is up ${formatINR(d.delta)} vs last month`),
    ...overBudgets.map(
      ({ budget: b, spentOnBudget }) =>
        `${b.type === "Category" ? b.category : b.type} budget went over by ${formatINR(spentOnBudget - b.amount)}`
    ),
  ];
  if (smallSpends.length >= SMALL_SPEND_MIN_COUNT) {
    leaks.push(`${smallSpends.length} small spends under ${formatINR(SMALL_SPEND_THRESHOLD)} added up to ${formatINR(smallSpendTotal)}`);
  }

  const wins: string[] = [
    ...decreases.map((d) => `${d.category} is down ${formatINR(Math.abs(d.delta))} vs last month`),
    ...(budgets.length > 0 ? [`Stayed within ${disciplinedBudgets.length} of ${budgets.length} budgets`] : []),
    ...goalContributions.map((c) => `Added ${formatINR(c.amount)} to ${c.goal.name}`),
  ];

  const monthLabel = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(monthStart);

  return (
    <PageContainer title={monthLabel} backHref="/insights">
      <HeroCard className="mb-4">
        <p className="text-[13px] text-white/70 mb-1">Spent</p>
        <MoneyAmount amount={spent} size="hero" className="text-white" />
      </HeroCard>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Income" amount={income} />
        <StatCard label="Monthly surplus" amount={surplus} />
      </div>

      {leaks.length > 0 ? (
        <div className="mb-6">
          <h2 className="text-[15px] font-extrabold text-cosfy-ink mb-3">Where it leaked</h2>
          <div className="space-y-2.5">
            {leaks.map((leak, i) => (
              <div key={i} className="flex items-center gap-3 rounded-card bg-cosfy-card border border-cosfy-border p-3.5">
                <IconTile icon={TrendingUp} tone="dark" size={36} />
                <p className="text-[13px] text-cosfy-ink">{leak}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {wins.length > 0 ? (
        <div className="mb-6">
          <h2 className="text-[15px] font-extrabold text-cosfy-ink mb-3">Wins</h2>
          <div className="space-y-2.5">
            {wins.map((win, i) => (
              <div key={i} className="flex items-center gap-3 rounded-card bg-cosfy-card border border-cosfy-border p-3.5">
                <IconTile icon={TrendingDown} tone="lime" size={36} />
                <p className="text-[13px] text-cosfy-ink">{win}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {leaks.length === 0 && wins.length === 0 ? (
        <p className="text-[13px] text-cosfy-muted mb-6">Not enough transactions this month to spot patterns yet.</p>
      ) : null}

      <ReportCoachTake report={{ spent, income, surplus, leaks, wins }} />
    </PageContainer>
  );
}
