import type { Metadata } from "next";
import Link from "next/link";
import { HeartPulse, FileText, PieChart, ChevronRight } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { DonutChart } from "@/components/ui/DonutChart";
import { TrendBarChart } from "@/components/ui/TrendBarChart";
import { IconTile } from "@/components/ui/IconTile";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { InsightsPanel } from "@/components/insights/InsightsPanel";
import { assignChartColors } from "@/lib/chart-colors";
import { cn } from "@/lib/cn";

const TREND_MONTHS = 6;

export const metadata: Metadata = {
  title: "AI Insights",
  description: "Spending trends, category breakdowns, and money habits, powered by AI.",
};

export default async function InsightsPage() {
  const user = await getCurrentUser();
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const trendStart = new Date(now.getFullYear(), now.getMonth() - (TREND_MONTHS - 1), 1);

  const transactions = await db.transaction.findMany({
    where: { userId: user.id, amount: { lt: 0 }, date: { gte: trendStart } },
  });

  const thisMonth: Record<string, number> = {};
  const lastMonth: Record<string, number> = {};

  for (const t of transactions) {
    if (t.date < lastMonthStart) continue;
    const bucket = t.date >= thisMonthStart ? thisMonth : lastMonth;
    bucket[t.category] = (bucket[t.category] ?? 0) + Math.abs(t.amount);
  }

  const categories = Array.from(new Set([...Object.keys(thisMonth), ...Object.keys(lastMonth)])).sort(
    (a, b) => (thisMonth[b] ?? 0) - (thisMonth[a] ?? 0)
  );

  const donutSegments = assignChartColors(
    categories
      .map((category) => ({ label: category, value: thisMonth[category] ?? 0 }))
      .filter((c) => c.value > 0)
  );

  const trendData = Array.from({ length: TREND_MONTHS }, (_, i) => {
    const monthDate = new Date(trendStart.getFullYear(), trendStart.getMonth() + i, 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
    const total = transactions
      .filter((t) => t.date >= monthDate && t.date < monthEnd)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return { label: monthDate.toLocaleDateString("en-IN", { month: "short" }), value: total };
  });

  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return (
    <PageContainer title="AI insights" backHref="/home">
      <div className="space-y-2.5 mb-4" data-tour="insights-links">
        <Link href="/health-score" className="flex items-center gap-3 rounded-card bg-cosfy-card border border-cosfy-border p-3.5">
          <IconTile icon={HeartPulse} tone="dark" size={40} />
          <span className="flex-1 text-[13px] font-semibold text-cosfy-ink">Financial health score</span>
          <ChevronRight size={18} className="text-cosfy-muted" />
        </Link>
        <Link
          href={`/reports/${currentYearMonth}`}
          className="flex items-center gap-3 rounded-card bg-cosfy-card border border-cosfy-border p-3.5"
        >
          <IconTile icon={FileText} tone="dark" size={40} />
          <span className="flex-1 text-[13px] font-semibold text-cosfy-ink">This month&apos;s report</span>
          <ChevronRight size={18} className="text-cosfy-muted" />
        </Link>
        <Link href="/summary" className="flex items-center gap-3 rounded-card bg-cosfy-card border border-cosfy-border p-3.5">
          <IconTile icon={PieChart} tone="dark" size={40} />
          <span className="flex-1 text-[13px] font-semibold text-cosfy-ink">Full summary, any time period</span>
          <ChevronRight size={18} className="text-cosfy-muted" />
        </Link>
      </div>

      {donutSegments.length > 0 ? (
        <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4 mb-4">
          <h2 className="text-[13px] font-bold text-cosfy-ink mb-3">Spending by category, this month</h2>
          <DonutChart segments={donutSegments} />
        </div>
      ) : null}

      {trendData.some((d) => d.value > 0) ? (
        <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4 mb-4">
          <h2 className="text-[13px] font-bold text-cosfy-ink mb-3">Last {TREND_MONTHS} months</h2>
          <TrendBarChart data={trendData} />
        </div>
      ) : null}

      <div className="space-y-3 mb-6">
        {categories.length === 0 ? (
          <p className="text-[13px] text-cosfy-muted">Not enough data yet, add a few expenses first.</p>
        ) : (
          categories.map((category) => {
            const current = thisMonth[category] ?? 0;
            const previous = lastMonth[category] ?? 0;
            const delta = current - previous;
            return (
              <div key={category} className="flex items-center justify-between rounded-card bg-cosfy-card border border-cosfy-border p-3">
                <div>
                  <p className="font-bold text-[14px] text-cosfy-ink">{category}</p>
                  <p
                    className={cn(
                      "text-[12px] font-semibold",
                      delta > 0 ? "text-cosfy-red" : delta < 0 ? "text-cosfy-green" : "text-cosfy-muted"
                    )}
                  >
                    {delta === 0 ? "No change" : `${delta > 0 ? "+" : ""}${Math.round(delta)} vs last month`}
                  </p>
                </div>
                <MoneyAmount amount={current} size="md" />
              </div>
            );
          })
        )}
      </div>

      {categories.length > 0 ? <InsightsPanel thisMonth={thisMonth} lastMonth={lastMonth} /> : null}
    </PageContainer>
  );
}
