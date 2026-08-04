import { redirect } from "next/navigation";
import { Receipt, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { HeroCard } from "@/components/ui/HeroCard";
import { StatCard } from "@/components/ui/StatCard";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { EmptyState } from "@/components/ui/EmptyState";
import { TransactionRow } from "@/components/finance/TransactionRow";
import { QuickActionLink } from "@/components/home/QuickActionButton";
import { fetchFinanceHeadlines } from "@/lib/news-feed";
import Link from "next/link";

function parseMonthParam(m: string | undefined) {
  if (m && /^\d{4}-\d{2}$/.test(m)) {
    const [year, month] = m.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function monthParam(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user.onboardingCompleted) {
    redirect("/onboarding/goal");
  }

  const { m } = await searchParams;
  const monthStart = parseMonthParam(m);
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
  const isCurrentMonth = monthParam(monthStart) === monthParam(new Date());
  const prevMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1);
  const nextMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);

  const [monthTransactions, recentTransactions, headlines] = await Promise.all([
    db.transaction.findMany({
      where: { userId: user.id, date: { gte: monthStart, lt: monthEnd } },
    }),
    db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 5,
    }),
    fetchFinanceHeadlines(3),
  ]);

  const income = monthTransactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const spent = monthTransactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const surplus = income - spent;

  const monthLabel = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(monthStart);

  return (
    <div className="px-5 pt-6 pb-28 md:px-10 md:pt-10 md:max-w-2xl md:mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[13px] text-cosfy-muted">Hi there</p>
          <p className="text-[18px] font-extrabold text-cosfy-ink">Welcome to Cosfy</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mb-2">
        <Link
          href={`/home?m=${monthParam(prevMonth)}`}
          aria-label="Previous month"
          className="w-7 h-7 flex items-center justify-center rounded-full bg-cosfy-card-soft text-cosfy-muted"
        >
          <ChevronLeft size={16} />
        </Link>
        <span className="text-[12px] font-semibold text-cosfy-muted min-w-[9ch] text-center">{monthLabel}</span>
        {isCurrentMonth ? (
          <span className="w-7 h-7" />
        ) : (
          <Link
            href={`/home?m=${monthParam(nextMonth)}`}
            aria-label="Next month"
            className="w-7 h-7 flex items-center justify-center rounded-full bg-cosfy-card-soft text-cosfy-muted"
          >
            <ChevronRight size={16} />
          </Link>
        )}
      </div>

      <HeroCard>
        <p className="text-[13px] text-white/70 mb-1">This month&apos;s spending</p>
        <MoneyAmount amount={spent} size="hero" className="text-white" />
      </HeroCard>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <StatCard label="Income" amount={income} />
        <StatCard label="Monthly surplus" amount={surplus} />
      </div>

      <div className="grid grid-cols-2 gap-2 mt-6 max-w-[220px] mx-auto">
        <QuickActionLink href="/scan/edit-items" icon="Receipt" label="Split bill" />
        <QuickActionLink href="/groups" icon="Users" label="Groups" />
      </div>

      <div className="rounded-card bg-cosfy-lime-pale border border-cosfy-lime-soft p-4 mt-6">
        <p className="text-[13px] font-semibold text-cosfy-lime-ink">
          {monthTransactions.length === 0
            ? "Add your first expense to get personalised insights."
            : `You've logged ${monthTransactions.length} transaction${monthTransactions.length === 1 ? "" : "s"} this month.`}
        </p>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[15px] font-extrabold text-cosfy-ink">Recent activity</h2>
          {recentTransactions.length > 0 && (
            <Link href="/transactions" className="text-[12px] font-semibold text-cosfy-lime-deep">
              See all
            </Link>
          )}
        </div>
        {recentTransactions.length === 0 ? (
          <EmptyState icon={Receipt} title="No expenses yet" description="Tap + to add your first." />
        ) : (
          <div className="space-y-2.5">
            {recentTransactions.map((t) => (
              <TransactionRow
                key={t.id}
                description={t.description}
                category={t.category}
                paymentMode={t.paymentMode}
                amount={t.amount}
                date={t.date}
              />
            ))}
          </div>
        )}
      </div>

      {headlines.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[15px] font-extrabold text-cosfy-ink">Finance news</h2>
            <Link href="/news" className="text-[12px] font-semibold text-cosfy-lime-deep">
              See all
            </Link>
          </div>
          <div className="space-y-2.5">
            {headlines.map((h, i) => (
              <a
                key={i}
                href={h.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between gap-2 rounded-card bg-cosfy-card border border-cosfy-border p-3.5"
              >
                <div>
                  <p className="text-[13px] font-semibold text-cosfy-ink leading-snug">{h.title}</p>
                  <p className="text-[11px] text-cosfy-muted mt-1">{h.source}</p>
                </div>
                <ExternalLink size={14} className="text-cosfy-muted shrink-0 mt-0.5" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
