import { PageContainer } from "@/components/layout/PageContainer";
import { HeroCard } from "@/components/ui/HeroCard";
import { StatCard } from "@/components/ui/StatCard";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { DonutChart } from "@/components/ui/DonutChart";
import { TrendBarChart } from "@/components/ui/TrendBarChart";
import { EmptyState } from "@/components/ui/EmptyState";
import { RangePicker } from "@/components/summary/RangePicker";
import { SummaryShareCard } from "@/components/summary/SummaryShareCard";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/format";
import { assignChartColors } from "@/lib/chart-colors";
import { getNetWorthBreakdown } from "@/lib/actions/net-worth";
import { resolveRange, monthBuckets, type RangePreset } from "@/lib/summary-range";
import { PieChart } from "lucide-react";

export default async function SummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; start?: string; end?: string }>;
}) {
  const { range, start: startParam, end: endParam } = await searchParams;
  const preset: RangePreset = ["this-month", "last-3-months", "this-year", "all-time", "custom"].includes(range ?? "")
    ? (range as RangePreset)
    : "this-month";

  const { start, end, label: rangeLabel } = resolveRange(preset, startParam, endParam);

  const user = await getCurrentUser();
  const [transactions, netWorth] = await Promise.all([
    db.transaction.findMany({ where: { userId: user.id, date: { gte: start, lt: end } }, orderBy: { date: "desc" } }),
    getNetWorthBreakdown(user.id),
  ]);

  const income = transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const spent = transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const surplus = income - spent;
  const savingsRate = income > 0 ? Math.round((surplus / income) * 100) : 0;

  const categoryTotals: Record<string, number> = {};
  for (const t of transactions.filter((t) => t.amount < 0)) {
    categoryTotals[t.category] = (categoryTotals[t.category] ?? 0) + Math.abs(t.amount);
  }
  const donutSegments = assignChartColors(
    Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value }))
  );

  const buckets = monthBuckets(start, end);
  const trendData = buckets.map((b) => ({
    label: b.label,
    value: transactions
      .filter((t) => t.amount < 0 && t.date >= b.bucketStart && t.date < b.bucketEnd)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0),
  }));
  const showTrend = buckets.length > 1;

  const biggestExpense = [...transactions].filter((t) => t.amount < 0).sort((a, b) => a.amount - b.amount)[0] ?? null;

  const hasData = transactions.length > 0;

  const shareText = [
    `Cosfy summary, ${rangeLabel}`,
    "",
    `Income: ${formatINR(income)}`,
    `Spent: ${formatINR(spent)}`,
    `Surplus: ${formatINR(surplus)} (${savingsRate}% saved)`,
    ...(donutSegments.length > 0
      ? ["", "Top categories:", ...donutSegments.slice(0, 5).map((c) => `${c.label}: ${formatINR(c.value)}`)]
      : []),
  ].join("\n");

  return (
    <PageContainer title="Summary" backHref="/insights">
      <RangePicker preset={preset} customStart={startParam} customEnd={endParam} />

      {!hasData ? (
        <EmptyState icon={PieChart} title="Nothing here yet" description="No transactions in this period." />
      ) : (
        <SummaryShareCard rangeLabel={rangeLabel} shareText={shareText}>
          <HeroCard className="mb-4">
            <p className="text-[13px] text-white/70 mb-1">{rangeLabel}</p>
            <MoneyAmount amount={spent} size="hero" className="text-white" />
            <p className="text-[12px] text-white/60 mt-1">spent</p>
          </HeroCard>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <StatCard label="Income" amount={income} />
            <StatCard label="Surplus" amount={surplus} />
          </div>

          <div className="rounded-card bg-cosfy-card border border-cosfy-border px-4 py-3.5 shadow-soft mb-4">
            <p className="text-[11px] font-medium text-cosfy-muted mb-1">Savings rate</p>
            <p className="text-[20px] font-extrabold text-cosfy-ink">{savingsRate}%</p>
          </div>

          {donutSegments.length > 0 ? (
            <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4 mb-4">
              <h2 className="text-[13px] font-bold text-cosfy-ink mb-3">Where it went</h2>
              <DonutChart segments={donutSegments} />
            </div>
          ) : null}

          {showTrend ? (
            <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4 mb-4">
              <h2 className="text-[13px] font-bold text-cosfy-ink mb-3">Monthly trend</h2>
              <TrendBarChart data={trendData} />
            </div>
          ) : null}

          <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4 mb-4">
            <h2 className="text-[13px] font-bold text-cosfy-ink mb-3">At a glance</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-cosfy-muted">Transactions logged</span>
                <span className="font-semibold text-cosfy-ink">{transactions.length}</span>
              </div>
              {biggestExpense ? (
                <div className="flex justify-between text-[13px]">
                  <span className="text-cosfy-muted">Biggest expense</span>
                  <span className="font-semibold text-cosfy-ink">
                    {biggestExpense.description}, {formatINR(Math.abs(biggestExpense.amount))}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between text-[13px] pt-2 border-t border-cosfy-border">
                <span className="text-cosfy-muted">Net worth today</span>
                <span className="font-semibold text-cosfy-ink">{formatINR(netWorth.netWorth)}</span>
              </div>
            </div>
          </div>
        </SummaryShareCard>
      )}
    </PageContainer>
  );
}
