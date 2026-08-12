"use client";

import { useTransition } from "react";
import type { Loan } from "@prisma/client";
import { Landmark, Trash2 } from "lucide-react";
import { RenewalRowHeader } from "@/components/ui/RenewalRowHeader";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { cn } from "@/lib/cn";
import { nextDueDate, daysUntil, dueUrgency } from "@/lib/credit-card-status";
import { formatShortDate } from "@/lib/format";
import { recordEmiPayment, deleteLoan } from "@/lib/actions/loans";

const URGENCY_LABEL = {
  overdue: (days: number) => `Overdue by ${Math.abs(days)}d`,
  soon: (days: number) => (days === 0 ? "EMI due today" : `EMI due in ${days}d`),
  upcoming: (days: number) => `EMI due in ${days}d`,
  paid: () => "Fully paid off",
};

export function LoanList({ loans }: { loans: Loan[] }) {
  return (
    <div className="space-y-3">
      {loans.map((loan) => (
        <LoanRow key={loan.id} loan={loan} />
      ))}
    </div>
  );
}

function LoanRow({ loan }: { loan: Loan }) {
  const [isPending, startTransition] = useTransition();
  const due = nextDueDate(loan.dueDay);
  const days = daysUntil(due);
  const urgency = dueUrgency(days, loan.outstandingPrincipal);

  function markEmiPaid() {
    startTransition(async () => {
      await recordEmiPayment(loan.id);
    });
  }

  function remove() {
    startTransition(async () => {
      await deleteLoan(loan.id);
    });
  }

  return (
    <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4">
      <RenewalRowHeader
        icon={Landmark}
        title={loan.name}
        subtitle={loan.lender ? <span className="text-cosfy-muted font-normal"> · {loan.lender}</span> : null}
        statusLine={`${URGENCY_LABEL[urgency](days)} · ${formatShortDate(due)}`}
        urgency={urgency}
        amount={loan.outstandingPrincipal}
      />
      <div className="flex gap-2 mt-3">
        {loan.outstandingPrincipal > 0 ? (
          <SecondaryButton className="flex-1 h-9 text-[12px]" onClick={markEmiPaid} disabled={isPending}>
            Mark EMI paid (−<MoneyAmount amount={loan.emiAmount} size="sm" />)
          </SecondaryButton>
        ) : null}
        <SecondaryButton
          className={cn("h-9 text-[12px] px-3", loan.outstandingPrincipal > 0 ? "" : "flex-1")}
          onClick={remove}
          disabled={isPending}
        >
          <Trash2 size={14} />
        </SecondaryButton>
      </div>
    </div>
  );
}
