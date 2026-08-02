"use client";

import { useMemo, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Input, FieldLabel } from "@/components/ui/Input";
import { PillChip } from "@/components/ui/PillChip";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { calculateTax, type TaxRegime } from "@/lib/tax-calculator";

export default function TaxCalculatorPage() {
  const [income, setIncome] = useState("");
  const [deductions80C, setDeductions80C] = useState("");
  const [regime, setRegime] = useState<TaxRegime>("new");

  const gross = parseFloat(income) || 0;
  const deductions = parseFloat(deductions80C) || 0;

  const result = useMemo(() => calculateTax(gross, regime, deductions), [gross, regime, deductions]);
  const otherRegimeResult = useMemo(
    () => calculateTax(gross, regime === "new" ? "old" : "new", deductions),
    [gross, regime, deductions]
  );

  const betterRegime = result.totalTax <= otherRegimeResult.totalTax ? regime : (regime === "new" ? "old" : "new");

  return (
    <PageContainer title="Tax calculator" backHref="/home">
      <div className="space-y-4">
        <div>
          <FieldLabel>Annual gross salary</FieldLabel>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="e.g. 1200000"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
          />
        </div>

        <div>
          <p className="text-[12px] font-semibold text-cosfy-ink-soft mb-2">Regime</p>
          <div className="flex gap-2">
            <PillChip variant={regime === "new" ? "active" : "inactive"} onClick={() => setRegime("new")}>
              New regime
            </PillChip>
            <PillChip variant={regime === "old" ? "active" : "inactive"} onClick={() => setRegime("old")}>
              Old regime
            </PillChip>
          </div>
        </div>

        {regime === "old" ? (
          <div>
            <FieldLabel>80C deductions (PF, ELSS, insurance — max ₹1.5L)</FieldLabel>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="e.g. 150000"
              value={deductions80C}
              onChange={(e) => setDeductions80C(e.target.value)}
            />
          </div>
        ) : null}

        {gross > 0 ? (
          <div className="space-y-3 mt-2">
            <div className="rounded-card bg-cosfy-dark-card text-white p-5">
              <p className="text-[13px] text-white/70 mb-1">Estimated take-home / year</p>
              <MoneyAmount amount={result.inHandAnnual} size="hero" className="text-white" />
              <p className="text-[13px] text-white/70 mt-1">
                <MoneyAmount amount={result.inHandMonthly} size="sm" className="text-white" /> / month
              </p>
            </div>

            <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4 space-y-2">
              <Row label="Taxable income" value={result.taxableIncome} />
              <Row label="Tax (before cess)" value={result.taxBeforeCess} />
              <Row label="Health & education cess (4%)" value={result.cess} />
              <Row label="Total tax" value={result.totalTax} bold />
              <div className="flex items-center justify-between text-[13px] text-cosfy-muted pt-2 border-t border-cosfy-border">
                <span>Effective tax rate</span>
                <span className="font-semibold text-cosfy-ink">{result.effectiveRate}%</span>
              </div>
            </div>

            <div className="rounded-card bg-cosfy-lime-pale border border-cosfy-lime-soft p-4">
              <p className="text-[13px] font-semibold text-cosfy-lime-ink">
                {betterRegime === regime
                  ? `${regime === "new" ? "New" : "Old"} regime looks better for you here — saves ${new Intl.NumberFormat("en-IN").format(Math.abs(result.totalTax - otherRegimeResult.totalTax))} vs the other regime.`
                  : `Switching to the ${betterRegime === "new" ? "new" : "old"} regime could save you ${new Intl.NumberFormat("en-IN").format(Math.abs(result.totalTax - otherRegimeResult.totalTax))}.`}
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex items-start gap-2 text-[12px] text-cosfy-amber pt-2">
          <TriangleAlert size={14} className="mt-[1px] shrink-0" />
          <p>
            Estimate based on FY2025-26 slabs. Doesn&apos;t account for HRA, other exemptions, or surcharge on high
            incomes. Not tax advice — check with a CA before filing.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "text-[14px] font-bold text-cosfy-ink" : "text-[13px] text-cosfy-muted"}>{label}</span>
      <MoneyAmount amount={value} size={bold ? "md" : "sm"} />
    </div>
  );
}
