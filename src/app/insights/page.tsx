import { PageContainer } from "@/components/layout/PageContainer";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { InsightsPanel } from "@/components/insights/InsightsPanel";
import { cn } from "@/lib/cn";

export default async function InsightsPage() {
  const user = await getCurrentUser();
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const transactions = await db.transaction.findMany({
    where: { userId: user.id, amount: { lt: 0 }, date: { gte: lastMonthStart } },
  });

  const thisMonth: Record<string, number> = {};
  const lastMonth: Record<string, number> = {};

  for (const t of transactions) {
    const bucket = t.date >= thisMonthStart ? thisMonth : lastMonth;
    bucket[t.category] = (bucket[t.category] ?? 0) + Math.abs(t.amount);
  }

  const categories = Array.from(new Set([...Object.keys(thisMonth), ...Object.keys(lastMonth)])).sort(
    (a, b) => (thisMonth[b] ?? 0) - (thisMonth[a] ?? 0)
  );

  return (
    <PageContainer title="AI insights" backHref="/home">
      <div className="space-y-3 mb-6">
        {categories.length === 0 ? (
          <p className="text-[13px] text-cosfy-muted">Not enough data yet — add a few expenses first.</p>
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
