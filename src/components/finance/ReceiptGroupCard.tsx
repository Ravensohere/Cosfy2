"use client";

import { useState } from "react";
import { ChevronDown, Store } from "lucide-react";
import { TransactionRow } from "@/components/finance/TransactionRow";
import { formatDate, formatINR } from "@/lib/format";
import type { CategoryValue, PaymentModeValue } from "@/lib/constants";
import { cn } from "@/lib/cn";

type ReceiptTransaction = {
  id: string;
  description: string;
  category: CategoryValue;
  paymentMode: PaymentModeValue;
  amount: number;
  date: Date;
  cardId: string | null;
};

export function ReceiptGroupCard({
  merchant,
  date,
  transactions,
}: {
  merchant: string;
  date: Date;
  transactions: ReceiptTransaction[];
}) {
  const [open, setOpen] = useState(false);
  // Derived from the live line items rather than the Receipt's stored total,
  // so editing or deleting one item can't leave a stale group total behind.
  const total = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="rounded-card border border-cosfy-border bg-cosfy-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-3.5"
      >
        <div className="w-11 h-11 rounded-full bg-cosfy-card-soft flex items-center justify-center shrink-0">
          <Store size={19} className="text-cosfy-ink-soft" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="font-bold text-[14px] text-cosfy-ink truncate">{merchant}</p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="text-[11px] font-semibold text-cosfy-ink-soft bg-cosfy-card-soft px-2 py-0.5 rounded-full">
              {transactions.length} item{transactions.length === 1 ? "" : "s"}
            </span>
            <span className="text-[11px] text-cosfy-muted">{formatDate(date)}</span>
          </div>
        </div>
        <p className="text-[15px] font-extrabold text-cosfy-ink shrink-0">{formatINR(-total)}</p>
        <ChevronDown size={16} className={cn("text-cosfy-muted shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="space-y-2 px-2.5 pb-2.5">
          {transactions.map((t) => (
            <TransactionRow
              key={t.id}
              id={t.id}
              description={t.description}
              category={t.category}
              paymentMode={t.paymentMode}
              amount={t.amount}
              date={t.date}
              cardId={t.cardId}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
