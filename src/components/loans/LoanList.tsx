"use client";

import { useTransition } from "react";
import type { Loan } from "@prisma/client";
import { Landmark, Trash2 } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { cn } from "@/lib/cn";
import { nextDueDate, daysUntil, dueUrgency } from "@/lib/credit-card-status";
import { recordEmiPayment, deleteLoan } from "@/lib/actions/loans";

const URGENCY_STYLES = {
  overdue: "text-cosfy-red",
  soon: "text-cosfy-amber",
  upcoming: "text-cosfy-muted",
  paid: "text-cosfy-green",
};

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
      <div className="flex items-center gap-3">
        <IconTile icon={Landmark} tone="dark" size={44} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[14px] text-cosfy-ink truncate">
            {loan.name}
            {loan.lender ? <span className="text-cosfy-muted font-normal"> · {loan.lender}</span> : null}
          </p>
          <p className={cn("text-[12px] font-semibold", URGENCY_STYLES[urgency])}>
            {URGENCY_LABEL[urgency](days)} · {due.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </p>
        </div>
        <MoneyAmount amount={loan.outstandingPrincipal} size="md" />
      </div>
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
