"use client";

import { useState } from "react";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconTile } from "@/components/ui/IconTile";
import { Receipt, Scale, History, CheckCircle2 } from "lucide-react";
import { PillChip } from "@/components/ui/PillChip";
import { formatDate } from "@/lib/format";

type ExpenseRow = { id: string; description: string; totalAmount: number; paidByName: string; date: Date };
type DebtRow = { fromName: string; toName: string; amount: number; involvesYou: boolean };
type SettlementRow = { fromName: string; toName: string; amount: number; date: Date; note: string | null };

export function GroupTabs({
  expenses,
  debts,
  settlements,
}: {
  expenses: ExpenseRow[];
  debts: DebtRow[];
  settlements: SettlementRow[];
}) {
  const [tab, setTab] = useState<"expenses" | "balances" | "history">("expenses");

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <PillChip variant={tab === "expenses" ? "active" : "inactive"} onClick={() => setTab("expenses")}>
          Expenses
        </PillChip>
        <PillChip variant={tab === "balances" ? "active" : "inactive"} onClick={() => setTab("balances")}>
          Balances
        </PillChip>
        <PillChip variant={tab === "history" ? "active" : "inactive"} onClick={() => setTab("history")}>
          History
        </PillChip>
      </div>

      {tab === "expenses" &&
        (expenses.length === 0 ? (
          <EmptyState icon={Receipt} title="No expenses yet" description="Add the first shared expense." />
        ) : (
          <div className="space-y-3">
            {expenses.map((e) => (
              <div key={e.id} className="flex items-center gap-3 rounded-card bg-cosfy-card border border-cosfy-border p-4">
                <IconTile icon={Receipt} tone="dark" size={44} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[14px] text-cosfy-ink truncate">{e.description}</p>
                  <p className="text-[12px] text-cosfy-muted">
                    Paid by {e.paidByName} · {formatDate(e.date)}
                  </p>
                </div>
                <MoneyAmount amount={-e.totalAmount} size="md" />
              </div>
            ))}
          </div>
        ))}

      {tab === "balances" &&
        (debts.length === 0 ? (
          <EmptyState icon={Scale} title="All settled up" description="No one owes anything in this group." />
        ) : (
          <div className="space-y-3">
            {debts.map((d, i) => (
              <div key={i} className="flex items-center gap-3 rounded-card bg-cosfy-card border border-cosfy-border p-4">
                <IconTile icon={Scale} tone={d.involvesYou ? "dark" : "soft"} size={44} />
                <p className="flex-1 min-w-0 text-[14px] text-cosfy-ink">
                  <span className="font-semibold">{d.fromName}</span> owes{" "}
                  <span className="font-semibold">{d.toName}</span>
                </p>
                <MoneyAmount amount={d.amount} size="md" className={d.involvesYou ? "text-cosfy-red" : undefined} />
              </div>
            ))}
          </div>
        ))}

      {tab === "history" &&
        (settlements.length === 0 ? (
          <EmptyState icon={History} title="No settlements yet" description="Recorded settlements will show here." />
        ) : (
          <div className="space-y-3">
            {settlements.map((s, i) => (
              <div key={i} className="flex items-center gap-3 rounded-card bg-cosfy-card border border-cosfy-border p-4">
                <IconTile icon={CheckCircle2} tone="soft" size={44} />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-cosfy-ink">
                    <span className="font-semibold">{s.fromName}</span> paid{" "}
                    <span className="font-semibold">{s.toName}</span>
                  </p>
                  <p className="text-[12px] text-cosfy-muted">{formatDate(s.date)}</p>
                </div>
                <MoneyAmount amount={s.amount} size="md" />
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}
