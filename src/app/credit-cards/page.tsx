import type { Metadata } from "next";
import { CreditCard as CreditCardIcon } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { DonutChart } from "@/components/ui/DonutChart";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { CreditCardList } from "@/components/credit-cards/CreditCardList";
import { AddCreditCardButton } from "@/components/credit-cards/AddCreditCardButton";
import { istDateString, istMidnight } from "@/lib/ist-date";
import { assignChartColors } from "@/lib/chart-colors";
import { formatINR, formatMonthYear } from "@/lib/format";

export const metadata: Metadata = {
  title: "Cards",
  description: "Track credit and debit cards, due dates, and where your card spend goes.",
};

export default async function CreditCardsPage() {
  const user = await getCurrentUser();
  const cards = await db.creditCard.findMany({ where: { userId: user.id }, orderBy: { dueDay: "asc" } });

  const currentMonth = istDateString().slice(0, 7);
  const [y, m] = currentMonth.split("-").map(Number);
  const nextMonth = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
  const monthStart = istMidnight(`${currentMonth}-01`);
  const monthEnd = istMidnight(`${nextMonth}-01`);

  const cardSpend = await Promise.all(
    cards.map(async (card) => {
      const rows = await db.transaction.findMany({
        where: { userId: user.id, cardId: card.id, amount: { lt: 0 }, date: { gte: monthStart, lt: monthEnd } },
      });
      return { card, spent: rows.reduce((sum, t) => sum + Math.abs(t.amount), 0) };
    })
  );

  const totalCardSpend = cardSpend.reduce((sum, c) => sum + c.spent, 0);
  const donutSegments = assignChartColors(
    cardSpend
      .filter((c) => c.spent > 0)
      .map((c) => ({ label: c.card.name, value: c.spent }))
      .sort((a, b) => b.value - a.value)
  );

  const topCard = [...cardSpend].sort((a, b) => b.spent - a.spent)[0];
  const topShare = topCard && totalCardSpend > 0 ? topCard.spent / totalCardSpend : 0;
  const recommendation =
    topCard && topShare >= 0.4 && cardSpend.filter((c) => c.spent > 0).length > 1
      ? `${Math.round(topShare * 100)}% of this month's card spend went on ${topCard.card.name}. If that's not your best rewards or cashback card for those purchases, it's worth checking whether another card earns more there.`
      : null;

  return (
    <PageContainer title="Cards" backHref="/home" action={<AddCreditCardButton />}>
      {cards.length === 0 ? (
        <EmptyState
          icon={CreditCardIcon}
          title="No cards tracked yet"
          description="Add a credit or debit card to keep an eye on due dates and see where its spend goes."
          action={<AddCreditCardButton variant="primary" />}
        />
      ) : (
        <>
          {totalCardSpend > 0 ? (
            <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4 mb-4">
              <h2 className="text-[13px] font-bold text-cosfy-ink mb-1">
                Card spend, {formatMonthYear(monthStart)}
              </h2>
              <MoneyAmount amount={totalCardSpend} size="lg" />
              <div className="mt-3">
                <DonutChart segments={donutSegments} size={160} />
              </div>
              {recommendation ? (
                <div className="rounded-card bg-cosfy-lime-pale border border-cosfy-lime-soft p-3 mt-4">
                  <p className="text-[12px] font-semibold text-cosfy-lime-ink leading-relaxed">{recommendation}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-card bg-cosfy-card-soft border border-cosfy-border p-3.5 mb-4">
              <p className="text-[12px] text-cosfy-muted">
                Pick a card when adding an expense (payment mode: Card) to see spend totals and a breakdown here.
              </p>
            </div>
          )}

          <CreditCardList cards={cards} />
        </>
      )}
    </PageContainer>
  );
}
