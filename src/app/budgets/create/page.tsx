"use client";

import { useState, useTransition } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PillChip } from "@/components/ui/PillChip";
import { Input, FieldLabel, Select } from "@/components/ui/Input";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { BUDGET_TYPES, CATEGORIES, BUDGET_PRESETS, type CategoryValue } from "@/lib/constants";
import { createBudget } from "@/lib/actions/budgets";

const ALERT_THRESHOLDS = [50, 80, 100];

function toDateInput(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function CreateBudgetPage() {
  const [type, setType] = useState<(typeof BUDGET_TYPES)[number]>("Monthly");
  const [category, setCategory] = useState<CategoryValue>("Food");
  const [amount, setAmount] = useState("");
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [preset, setPreset] = useState<(typeof BUDGET_PRESETS)[number]["value"] | "none">("none");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function applyPreset(value: (typeof BUDGET_PRESETS)[number]["value"]) {
    setPreset(value);
    const config = BUDGET_PRESETS.find((p) => p.value === value);
    if (!config || value === "custom") {
      setStartDate(toDateInput(new Date()));
      const custom = new Date();
      custom.setMonth(custom.getMonth() + 1);
      setEndDate(toDateInput(custom));
      return;
    }
    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + config.months);
    setStartDate(toDateInput(start));
    setEndDate(toDateInput(end));
  }

  function handleSave() {
    setError(null);
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError("Enter an amount greater than 0");
      return;
    }
    startTransition(async () => {
      const result = await createBudget({
        type,
        category: type === "Category" ? category : undefined,
        amount: numericAmount,
        alertThreshold,
        startDate: preset !== "none" && startDate ? new Date(startDate) : undefined,
        endDate: preset !== "none" && endDate ? new Date(endDate) : undefined,
      });
      if (result && !result.ok) {
        setError(result.error);
      }
    });
  }

  return (
    <PageContainer title="Create budget" backHref="/budgets">
      <div className="space-y-5">
        <div>
          <FieldLabel>Budget type</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {BUDGET_TYPES.map((t) => (
              <PillChip key={t} variant={type === t ? "active" : "inactive"} onClick={() => setType(t)}>
                {t}
              </PillChip>
            ))}
          </div>
        </div>

        {type === "Category" && (
          <div>
            <FieldLabel>Category</FieldLabel>
            <Select value={category} onChange={(e) => setCategory(e.target.value as CategoryValue)}>
              {CATEGORIES.filter((c) => c !== "Income").map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div>
          <FieldLabel>Amount</FieldLabel>
          <Input
            type="number"
            inputMode="decimal"
            placeholder="e.g. 15000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div>
          <FieldLabel>Alert threshold</FieldLabel>
          <div className="flex gap-2">
            {ALERT_THRESHOLDS.map((t) => (
              <PillChip key={t} variant={alertThreshold === t ? "active" : "inactive"} onClick={() => setAlertThreshold(t)}>
                {t}%
              </PillChip>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Seasonal budget (optional)</FieldLabel>
          <div className="flex flex-wrap gap-2 mb-3">
            <PillChip variant={preset === "none" ? "active" : "inactive"} onClick={() => setPreset("none")}>
              Open-ended
            </PillChip>
            {BUDGET_PRESETS.map((p) => (
              <PillChip key={p.value} variant={preset === p.value ? "active" : "inactive"} onClick={() => applyPreset(p.value)}>
                {p.label}
              </PillChip>
            ))}
          </div>
          {preset !== "none" ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Starts</FieldLabel>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <FieldLabel>Ends</FieldLabel>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-3 rounded-card bg-cosfy-card border border-cosfy-border p-4 opacity-60">
          <div className="flex-1">
            <p className="font-bold text-[14px] text-cosfy-ink">Rollover unused budget</p>
            <p className="text-[12px] text-cosfy-muted">Coming later</p>
          </div>
          <ToggleSwitch checked={false} onChange={() => {}} disabled />
        </div>

        {error ? <p className="text-[13px] text-cosfy-red">{error}</p> : null}

        <PrimaryButton fullWidth disabled={isPending} onClick={handleSave}>
          {isPending ? "Saving…" : "Save budget"}
        </PrimaryButton>
      </div>
    </PageContainer>
  );
}
