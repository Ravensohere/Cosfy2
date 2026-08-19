import Link from "next/link";
import type { CreditCard } from "@prisma/client";
import { ChevronRight } from "lucide-react";
import { CardVisual } from "@/components/credit-cards/CardVisual";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { nextDueDate, daysUntil, dueUrgency, URGENCY_STYLES } from "@/lib/credit-card-status";
import { formatShortDate } from "@/lib/format";
import { cn } from "@/lib/cn";

const URGENCY_LABEL = {
  overdue: (days: number) => `Overdue by ${Math.abs(days)}d`,
  soon: (days: number) => (days === 0 ? "Due today" : `Due in ${days}d`),
  upcoming: (days: number) => `Due in ${days}d`,
  paid: () => "Paid",
};

export function CreditCardList({ cards }: { cards: CreditCard[] }) {
  return (
    <div className="space-y-3">
      {cards.map((card) => (
        <CreditCardRow key={card.id} card={card} />
      ))}
    </div>
  );
}

function CreditCardRow({ card }: { card: CreditCard }) {
  const hasDueTracking = card.kind === "Credit" && card.dueDay != null;
  const due = hasDueTracking ? nextDueDate(card.dueDay!) : null;
  const days = due ? daysUntil(due) : 0;
  const urgency = due ? dueUrgency(days, card.currentDue) : "paid";

  return (
    <Link
      href={`/credit-cards/${card.id}`}
      className="flex items-center gap-3 rounded-card bg-cosfy-card border border-cosfy-border p-3"
    >
      <div className="w-[104px] shrink-0">
        <CardVisual bank={card.bank} name={card.name} last4={card.last4} network={card.network} kind={card.kind} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[14px] text-cosfy-ink truncate">{card.name}</p>
        {due ? (
          <>
            <p className={cn("text-[12px] font-semibold", URGENCY_STYLES[urgency])}>
              {URGENCY_LABEL[urgency](days)} · {formatShortDate(due)}
            </p>
            <MoneyAmount amount={card.currentDue} size="sm" />
          </>
        ) : (
          <p className="text-[12px] text-cosfy-muted">Debit card</p>
        )}
      </div>
      <ChevronRight size={18} className="text-cosfy-muted shrink-0" />
    </Link>
  );
}
