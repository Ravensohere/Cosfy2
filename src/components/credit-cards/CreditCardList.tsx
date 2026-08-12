"use client";

import { useState, useTransition } from "react";
import type { CreditCard } from "@prisma/client";
import { CreditCard as CardIcon, Trash2, Gift } from "lucide-react";
import { RenewalRowHeader } from "@/components/ui/RenewalRowHeader";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { Input } from "@/components/ui/Input";
import { nextDueDate, daysUntil, dueUrgency } from "@/lib/credit-card-status";
import { formatShortDate } from "@/lib/format";
import { updateCreditCardDue, updateCreditCardRewards, deleteCreditCard } from "@/lib/actions/credit-cards";

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
  const [editingRewards, setEditingRewards] = useState(false);
  const [points, setPoints] = useState(String(card.rewardPointsBalance ?? ""));
  const [cashback, setCashback] = useState(String(card.cashbackYtd ?? ""));
  const due = nextDueDate(card.dueDay);
  const days = daysUntil(due);
  const urgency = dueUrgency(days, card.currentDue);

  function markPaid() {
    startTransition(async () => {
      await updateCreditCardDue(card.id, 0);
    });
  }

  function saveRewards() {
    startTransition(async () => {
      await updateCreditCardRewards(card.id, parseInt(points, 10) || 0, parseFloat(cashback) || 0);
      setEditingRewards(false);
    });
  }

  function remove() {
    startTransition(async () => {
      await deleteCreditCard(card.id);
    });
  }

  return (
    <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4">
      <RenewalRowHeader
        icon={CardIcon}
        title={card.name}
        subtitle={card.last4 ? <span className="text-cosfy-muted font-normal"> •• {card.last4}</span> : null}
        statusLine={`${URGENCY_LABEL[urgency](days)} · ${formatShortDate(due)}`}
        urgency={urgency}
        amount={card.currentDue}
      />

      {card.rewardPointsBalance || card.cashbackYtd ? (
        <p className="text-[12px] text-cosfy-muted mt-2 flex items-center gap-1">
          <Gift size={12} /> {card.rewardPointsBalance ?? 0} pts · <MoneyAmount amount={card.cashbackYtd ?? 0} size="sm" /> cashback YTD
        </p>
      ) : null}

      {editingRewards ? (
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Input type="number" className="h-9" placeholder="Points" value={points} onChange={(e) => setPoints(e.target.value)} />
          <Input
            type="number"
            className="h-9"
            placeholder="Cashback YTD"
            value={cashback}
            onChange={(e) => setCashback(e.target.value)}
          />
          <SecondaryButton className="col-span-2 h-9 text-[12px]" onClick={saveRewards} disabled={isPending}>
            Save rewards
          </SecondaryButton>
        </div>
      ) : null}

      <div className="flex gap-2 mt-3">
        {card.currentDue > 0 ? (
          <SecondaryButton className="flex-1 h-9 text-[12px]" onClick={markPaid} disabled={isPending}>
            Mark as paid
          </SecondaryButton>
        ) : null}
        <SecondaryButton className="h-9 text-[12px] px-3" onClick={() => setEditingRewards((v) => !v)} disabled={isPending}>
          <Gift size={14} />
        </SecondaryButton>
        <SecondaryButton className="h-9 text-[12px] px-3" onClick={remove} disabled={isPending}>
          <Trash2 size={14} />
        </SecondaryButton>
      </div>
    </div>
  );
}
