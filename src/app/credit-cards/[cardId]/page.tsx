import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Receipt } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { DonutChart } from "@/components/ui/DonutChart";
import { TransactionRow } from "@/components/finance/TransactionRow";
import { CardVisual } from "@/components/credit-cards/CardVisual";
import { CardDetailActions } from "@/components/credit-cards/CardDetailActions";
import { getCreditCard } from "@/lib/actions/credit-cards";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { nextDueDate, daysUntil, dueUrgency, URGENCY_STYLES } from "@/lib/credit-card-status";
import { istDateString, istMidnight } from "@/lib/ist-date";
import { assignChartColors } from "@/lib/chart-colors";
import { formatShortDate, formatMonthYear } from "@/lib/format";
import type { CategoryValue, PaymentModeValue } from "@/lib/constants";
import { cn } from "@/lib/cn";

const URGENCY_LABEL = {
  overdue: (days: number) => `Overdue by ${Math.abs(days)}d`,
  soon: (days: number) => (days === 0 ? "Due today" : `Due in ${days}d`),
  upcoming: (days: number) => `Due in ${days}d`,
  paid: () => "Paid",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cardId: string }>;
}): Promise<Metadata> {
  const { cardId } = await params;
  const card = await getCreditCard(cardId);
  return { title: card?.name ?? "Card" };
}

export default async function CardDetailPage({ params }: { params: Promise<{ cardId: string }> }) {
  const { cardId } = await params;
  const card = await getCreditCard(cardId);
  if (!card) notFound();

  const user = await getCurrentUser();
  const currentMonth = istDateString().slice(0, 7);
  const [y, m] = currentMonth.split("-").map(Number);
  const nextMonth = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
  const monthStart = istMidnight(`${currentMonth}-01`);
  const monthEnd = istMidnight(`${nextMonth}-01`);

  const [monthTransactions, recentTransactions] = await Promise.all([
    db.transaction.findMany({
      where: { userId: user.id, cardId: card.id, amount: { lt: 0 }, date: { gte: monthStart, lt: monthEnd } },
    }),
    db.transaction.findMany({
      where: { userId: user.id, cardId: card.id },
      orderBy: { date: "desc" },
      take: 50,
    }),
  ]);

  const monthSpend = monthTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const categoryTotals = new Map<string, number>();
  for (const t of monthTransactions) {
    categoryTotals.set(t.category, (categoryTotals.get(t.category) ?? 0) + Math.abs(t.amount));
  }
  const donutSegments = assignChartColors(
    Array.from(categoryTotals.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
  );

  const hasDueTracking = card.kind === "Credit" && card.dueDay != null;
  const due = hasDueTracking ? nextDueDate(card.dueDay!) : null;
  const days = due ? daysUntil(due) : 0;
  const urgency = due ? dueUrgency(days, card.currentDue) : "paid";

  return (
    <PageContainer title={card.name} backHref="/credit-cards">
      <CardVisual bank={card.bank} name={card.name} last4={card.last4} network={card.network} kind={card.kind} size="large" className="mb-4" />

      {due ? (
        <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4 mb-4">
          <div className="flex items-center justify-between mb-1">
            <p className={cn("text-[13px] font-semibold", URGENCY_STYLES[urgency])}>
              {URGENCY_LABEL[urgency](days)} · {formatShortDate(due)}
            </p>
          </div>
          <MoneyAmount amount={card.currentDue} size="lg" />
          {card.statementDay ? (
            <p className="text-[11px] text-cosfy-muted mt-1">Statement day: {card.statementDay}</p>
          ) : null}
        </div>
      ) : null}

      {(card.rewardPointsBalance ?? 0) > 0 || (card.cashbackYtd ?? 0) > 0 ? (
        <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-cosfy-muted">Reward points</p>
            <p className="text-[15px] font-bold text-cosfy-ink">{card.rewardPointsBalance ?? 0}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-cosfy-muted">Cashback YTD</p>
            <MoneyAmount amount={card.cashbackYtd ?? 0} size="md" />
          </div>
        </div>
      ) : null}

      {monthSpend > 0 ? (
        <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4 mb-4">
          <h2 className="text-[13px] font-bold text-cosfy-ink mb-1">Spend, {formatMonthYear(monthStart)}</h2>
          <MoneyAmount amount={monthSpend} size="lg" />
          <div className="mt-3">
            <DonutChart segments={donutSegments} size={160} />
          </div>
        </div>
      ) : null}

      <div className="mb-4">
        <CardDetailActions
          cardId={card.id}
          currentDue={card.currentDue}
          rewardPointsBalance={card.rewardPointsBalance}
          cashbackYtd={card.cashbackYtd}
        />
      </div>

      <h2 className="text-[13px] font-bold text-cosfy-ink mb-3">Recent transactions</h2>
      {recentTransactions.length === 0 ? (
        <EmptyState icon={Receipt} title="No transactions yet" description="Expenses paid with this card will show up here." />
      ) : (
        <div className="space-y-2.5">
          {recentTransactions.map((t) => (
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
      )}
    </PageContainer>
  );
}
