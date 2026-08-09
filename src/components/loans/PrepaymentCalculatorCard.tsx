"use client";

import { useMemo, useState } from "react";
import type { Loan } from "@prisma/client";
import { Calculator } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import { Input, FieldLabel } from "@/components/ui/Input";
import { PillChip } from "@/components/ui/PillChip";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { calculatePrepayment } from "@/lib/prepayment-calculator";

export function PrepaymentCalculatorCard({ loans }: { loans: Loan[] }) {
  const [loanId, setLoanId] = useState(loans[0]?.id ?? "");
  const [extraPayment, setExtraPayment] = useState("");

  const loan = loans.find((l) => l.id === loanId) ?? loans[0];
  const extra = parseFloat(extraPayment) || 0;

  const result = useMemo(() => {
    if (!loan || extra <= 0) return null;
    return calculatePrepayment({
      outstandingPrincipal: loan.outstandingPrincipal,
      annualInterestRate: loan.interestRate,
      emiAmount: loan.emiAmount,
      extraPayment: extra,
    });
  }, [loan, extra]);

  if (!loan) return null;

  return (
    <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4">
      <div className="flex items-center gap-3 mb-3">
        <IconTile icon={Calculator} tone="dark" size={40} />
        <p className="font-bold text-[14px] text-cosfy-ink">Prepayment calculator</p>
      </div>

      {loans.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
          {loans.map((l) => (
            <PillChip key={l.id} variant={l.id === loanId ? "active" : "inactive"} onClick={() => setLoanId(l.id)}>
              {l.name}
            </PillChip>
          ))}
        </div>
      ) : null}

      <FieldLabel>One-time extra payment</FieldLabel>
      <Input
        type="number"
        placeholder="e.g. 50000"
        value={extraPayment}
        onChange={(e) => setExtraPayment(e.target.value)}
      />

      {result ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-card bg-cosfy-card-soft p-3">
            <p className="text-[11px] text-cosfy-muted font-semibold">Months saved</p>
            <p className="text-[18px] font-extrabold text-cosfy-ink">{result.monthsSaved}</p>
          </div>
          <div className="rounded-card bg-cosfy-card-soft p-3">
            <p className="text-[11px] text-cosfy-muted font-semibold">Interest saved</p>
            <MoneyAmount amount={result.interestSaved} size="md" />
          </div>
        </div>
      ) : (
        <p className="text-[12px] text-cosfy-muted mt-3">
          Enter an extra payment to see how much interest and time it saves on {loan.name}.
        </p>
      )}
    </div>
  );
}
