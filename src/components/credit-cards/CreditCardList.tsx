"use client";

import { useTransition } from "react";
import type { CreditCard } from "@prisma/client";
import { CreditCard as CardIcon, Trash2 } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { cn } from "@/lib/cn";
import { nextDueDate, daysUntil, dueUrgency } from "@/lib/credit-card-status";
import { updateCreditCardDue, deleteCreditCard } from "@/lib/actions/credit-cards";

const URGENCY_STYLES = {
  overdue: "text-cosfy-red",
  soon: "text-cosfy-amber",
  upcoming: "text-cosfy-muted",
  paid: "text-cosfy-green",
};

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
  const [isPending, startTransition] = useTransition();
  const due = nextDueDate(card.dueDay);
  const days = daysUntil(due);
  const urgency = dueUrgency(days, card.currentDue);

  function markPaid() {
    startTransition(async () => {
      await updateCreditCardDue(card.id, 0);
    });
  }

  function remove() {
    startTransition(async () => {
      await deleteCreditCard(card.id);
    });
  }

  return (
    <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4">
      <div className="flex items-center gap-3">
        <IconTile icon={CardIcon} tone="dark" size={44} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[14px] text-cosfy-ink truncate">
            {card.name}
            {card.last4 ? <span className="text-cosfy-muted font-normal"> •• {card.last4}</span> : null}
          </p>
          <p className={cn("text-[12px] font-semibold", URGENCY_STYLES[urgency])}>
            {URGENCY_LABEL[urgency](days)} · {due.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </p>
        </div>
        <MoneyAmount amount={card.currentDue} size="md" />
      </div>
      <div className="flex gap-2 mt-3">
        {card.currentDue > 0 ? (
          <SecondaryButton className="flex-1 h-9 text-[12px]" onClick={markPaid} disabled={isPending}>
            Mark as paid
          </SecondaryButton>
        ) : null}
        <SecondaryButton
          className={cn("h-9 text-[12px] px-3", card.currentDue > 0 ? "" : "flex-1")}
          onClick={remove}
          disabled={isPending}
        >
          <Trash2 size={14} />
        </SecondaryButton>
      </div>
    </div>
  );
}
