"use client";

import { useState } from "react";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { EmptyState } from "@/components/ui/EmptyState";
import { Receipt, Scale, History } from "lucide-react";
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
      <div className="flex gap-2 mb-4">
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
          <div className="divide-y divide-cosfy-border">
            {expenses.map((e) => (
              <div key={e.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-semibold text-[14px] text-cosfy-ink">{e.description}</p>
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
          <div className="divide-y divide-cosfy-border">
            {debts.map((d, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <p className="text-[14px] text-cosfy-ink">
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
          <div className="divide-y divide-cosfy-border">
            {settlements.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div>
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
