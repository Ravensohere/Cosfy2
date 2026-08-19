import type { Metadata } from "next";
import { Plus, Wallet, Receipt } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { HeroCard } from "@/components/ui/HeroCard";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BudgetCard } from "@/components/finance/BudgetCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PastBudgetsToggle } from "@/components/finance/PastBudgetsToggle";
import { TransactionRow } from "@/components/finance/TransactionRow";
import { ExpenseFilterBar } from "@/components/finance/ExpenseFilterBar";
import { ExpenseShareCard } from "@/components/finance/ExpenseShareCard";
import { DonutChart } from "@/components/ui/DonutChart";
import { assignChartColors } from "@/lib/chart-colors";
import { formatShortDate, formatDate, formatINR } from "@/lib/format";
import { resolveExpenseFilter, type ExpenseFilterMode } from "@/lib/expense-filter";
import { istDateString, istMidnight } from "@/lib/ist-date";
import type { CategoryValue, PaymentModeValue } from "@/lib/constants";

/** Days in the given "YYYY-MM" month — pure calendar arithmetic, timezone-irrelevant. */
function daysInMonth(yearMonth: string) {
  const [y, m] = yearMonth.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

/** IST calendar-day key for grouping — Date#getFullYear/getMonth/getDate read the
 * runtime's local timezone (UTC on Vercel), which misfiles transactions near
 * midnight IST, so group by the IST calendar date instead. */
function dayKey(d: Date) {
  return istDateString(d);
}

function dayHeading(d: Date, now: Date) {
  const todayKey = istDateString(now);
  const yesterdayKey = istDateString(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  const key = dayKey(d);
  if (key === todayKey) return "Today";
  if (key === yesterdayKey) return "Yesterday";
  return formatDate(d);
}

export const metadata: Metadata = {
  title: "Expenses",
  description: "Track spending against your budget, with breakdowns by day, range, month, or year.",
};

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; date?: string; start?: string; end?: string; month?: string; year?: string }>;
}) {
  const user = await getCurrentUser();
  const sp = await searchParams;
  const filter = resolveExpenseFilter(sp.mode as ExpenseFilterMode | undefined, sp);
  const validModes: ExpenseFilterMode[] = ["day", "range", "month", "year"];
  const displayMode = validModes.includes(sp.mode as ExpenseFilterMode) ? (sp.mode as ExpenseFilterMode) : filter.mode;
  const allBudgets = await db.budget.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });

  const now = new Date();
  const budgets = allBudgets.filter((b) => !b.endDate || b.endDate >= now);
  const pastBudgets = allBudgets.filter((b) => b.endDate && b.endDate < now);

  const currentMonth = istDateString(now).slice(0, 7);
  const [currentY, currentM] = currentMonth.split("-").map(Number);
  const nextMonth = currentM === 12 ? `${currentY + 1}-01` : `${currentY}-${String(currentM + 1).padStart(2, "0")}`;
  const monthStart = istMidnight(`${currentMonth}-01`);
  const monthEnd = istMidnight(`${nextMonth}-01`);
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  async function spentFor(budget: (typeof budgets)[number]) {
    if (budget.type === "Weekly") {
      const rows = await db.transaction.findMany({
        where: { userId: user.id, amount: { lt: 0 }, date: { gte: weekStart, lte: now } },
      });
      return rows.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    }
    const rows = await db.transaction.findMany({
      where: {
        userId: user.id,
        amount: { lt: 0 },
        date: { gte: monthStart, lt: monthEnd },
        ...(budget.type === "Category" ? { category: budget.category ?? undefined } : {}),
      },
    });
    return rows.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }

  const monthlyBudget = budgets.find((b) => b.type === "Monthly");
  const otherBudgets = budgets.filter((b) => b.id !== monthlyBudget?.id);

  const monthlySpent = monthlyBudget ? await spentFor(monthlyBudget) : 0;
  const otherSpent = await Promise.all(otherBudgets.map((b) => spentFor(b)));

  const filteredTransactions = await db.transaction.findMany({
    where: { userId: user.id, amount: { lt: 0 }, date: { gte: filter.start, lt: filter.end } },
    orderBy: { date: "desc" },
  });
  const filteredSpent = filteredTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const proratedDailyBudget = monthlyBudget ? monthlyBudget.amount / daysInMonth(filter.month) : null;
  const rangeDays = Math.max(1, Math.round((filter.end.getTime() - filter.start.getTime()) / (24 * 60 * 60 * 1000)));

  const comparisonLimit = monthlyBudget
    ? filter.mode === "month"
      ? monthlyBudget.amount
      : filter.mode === "year"
        ? monthlyBudget.amount * 12
        : filter.mode === "day"
          ? Math.round(proratedDailyBudget!)
          : Math.round(proratedDailyBudget! * rangeDays)
    : null;
  const comparisonIsProrated = filter.mode === "day" || filter.mode === "range";

  const categoryTotals = new Map<string, number>();
  for (const t of filteredTransactions) {
    categoryTotals.set(t.category, (categoryTotals.get(t.category) ?? 0) + Math.abs(t.amount));
  }
  const donutSegments = assignChartColors(
    Array.from(categoryTotals.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
  );

  const dayGroups: { key: string; heading: string; total: number; items: typeof filteredTransactions }[] = [];
  for (const t of filteredTransactions) {
    const key = dayKey(t.date);
    let group = dayGroups.find((g) => g.key === key);
    if (!group) {
      group = { key, heading: dayHeading(t.date, now), total: 0, items: [] };
      dayGroups.push(group);
    }
    group.total += Math.abs(t.amount);
    group.items.push(t);
  }

  function truncate(text: string, max: number) {
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
  }
  function tableRow(left: string, right: string, leftWidth: number) {
    return `${left.padEnd(leftWidth)}${right.padStart(9)}`;
  }

  const shareLines = [
    `*Cosfy expenses — ${filter.label}*`,
    "",
    `Spent: *${formatINR(filteredSpent)}*${comparisonLimit ? `  (of ${formatINR(comparisonLimit)}${comparisonIsProrated ? " prorated" : ""} budget)` : ""}`,
    ...(donutSegments.length > 0
      ? [
          "",
          "*By category*",
          "```",
          ...donutSegments.map((c) => tableRow(truncate(c.label, 15), formatINR(c.value), 16)),
          "```",
        ]
      : []),
    ...(filteredTransactions.length > 0
      ? [
          "",
          "*Transactions*",
          "```",
          ...filteredTransactions.map((t) =>
            tableRow(`${formatShortDate(t.date)}  ${truncate(t.description, 16)}`, formatINR(Math.abs(t.amount)), 25)
          ),
          "```",
        ]
      : []),
  ];

  return (
    <PageContainer
      title="Expenses"
      action={
        <PrimaryButton href="/budgets/create" data-tour="budgets-new" className="h-9 px-4 text-[12px]">
          <Plus size={16} /> New budget
        </PrimaryButton>
      }
    >
      {budgets.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No budgets set"
          description="Add your first budget."
          action={<PrimaryButton href="/budgets/create">Add budget</PrimaryButton>}
        />
      ) : (
        <div className="space-y-3">
          {monthlyBudget && (
            <HeroCard>
              <p className="text-[13px] text-white/70 mb-1">Monthly budget</p>
              <div className="flex items-baseline justify-between mb-3">
                <MoneyAmount amount={monthlySpent} size="hero" className="text-white" />
                <span className="text-[13px] text-white/70">
                  of {new Intl.NumberFormat("en-IN").format(monthlyBudget.amount)}
                </span>
              </div>
              <ProgressBar value={monthlySpent} max={monthlyBudget.amount} trackClassName="bg-white/15" />
            </HeroCard>
          )}
          {otherBudgets.map((b, i) => (
            <BudgetCard
              key={b.id}
              title={b.type === "Category" ? `${b.category}` : "Weekly budget"}
              category={b.category}
              spent={otherSpent[i]}
              limit={b.amount}
              dateRangeLabel={
                b.startDate && b.endDate
                  ? `${formatShortDate(b.startDate)} – ${formatShortDate(b.endDate)}`
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {pastBudgets.length > 0 ? (
        <div className="mt-6">
          <PastBudgetsToggle
            budgets={pastBudgets.map((b) => ({
              id: b.id,
              title: b.type === "Category" ? `${b.category}` : b.type === "Weekly" ? "Weekly budget" : "Monthly budget",
              amount: b.amount,
              dateRangeLabel:
                b.startDate && b.endDate
                  ? `${formatShortDate(b.startDate)} – ${formatDate(b.endDate)}`
                  : "",
            }))}
          />
        </div>
      ) : null}

      <div className="mt-6">
        <h2 className="text-[15px] font-extrabold text-cosfy-ink mb-3">Expense details</h2>
        <ExpenseFilterBar
          mode={displayMode}
          date={sp.date}
          start={sp.start}
          end={sp.end}
          month={filter.month}
          year={filter.year}
        />

        <ExpenseShareCard periodLabel={filter.label} shareText={shareLines.join("\n")}>
          <div className="rounded-card bg-cosfy-card border border-cosfy-border px-4 py-3.5 shadow-soft mb-4">
            <p className="text-[11px] font-medium text-cosfy-muted mb-1">{filter.label}</p>
            <MoneyAmount amount={filteredSpent} size="lg" />
            {comparisonLimit ? (
              <div className="mt-3">
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-[12px] text-cosfy-muted">
                    vs budget{comparisonIsProrated ? " (prorated)" : ""}
                  </span>
                  <span className="text-[12px] text-cosfy-muted">of {new Intl.NumberFormat("en-IN").format(comparisonLimit)}</span>
                </div>
                <ProgressBar value={filteredSpent} max={comparisonLimit} />
                <p className="mt-1.5 text-[11px] font-semibold text-cosfy-muted">
                  {filteredSpent <= comparisonLimit
                    ? `${formatINR(comparisonLimit - filteredSpent)} left`
                    : `${formatINR(filteredSpent - comparisonLimit)} over`}
                </p>
              </div>
            ) : null}
          </div>

          {donutSegments.length > 0 ? (
            <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4 mb-4">
              <h3 className="text-[13px] font-bold text-cosfy-ink mb-3">Breakdown by category</h3>
              <DonutChart segments={donutSegments} />
            </div>
          ) : null}

          {filteredTransactions.length === 0 ? (
            <EmptyState icon={Receipt} title="Nothing here" description="No expenses in this period." />
          ) : (
            <div className="space-y-4">
              {dayGroups.map((group) => (
                <div key={group.key}>
                  <div className="flex items-baseline justify-between mb-2 px-0.5">
                    <span className="text-[12px] font-bold text-cosfy-ink-soft">{group.heading}</span>
                    <span className="text-[12px] font-semibold text-cosfy-muted">{formatINR(group.total)}</span>
                  </div>
                  <div className="space-y-2.5">
                    {group.items.map((t) => (
                      <TransactionRow
                        key={t.id}
                        id={t.id}
                        description={t.description}
                        category={t.category as CategoryValue}
                        paymentMode={t.paymentMode as PaymentModeValue}
                        amount={t.amount}
                        date={t.date}
                        cardId={t.cardId}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ExpenseShareCard>
      </div>
    </PageContainer>
  );
}
