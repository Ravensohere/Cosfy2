"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MoneyAmount } from "@/components/ui/MoneyAmount";

export function PastBudgetsToggle({
  budgets,
}: {
  budgets: { id: string; title: string; amount: number; dateRangeLabel: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[13px] font-semibold text-cosfy-muted"
      >
        Past seasonal budgets ({budgets.length})
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open ? (
        <div className="space-y-2 mt-3">
          {budgets.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-card bg-cosfy-card-soft p-3">
              <div>
                <p className="text-[13px] font-semibold text-cosfy-ink">{b.title}</p>
                <p className="text-[11px] text-cosfy-muted">{b.dateRangeLabel}</p>
              </div>
              <MoneyAmount amount={b.amount} size="sm" />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
