"use client";

import { useMemo, useState, useTransition } from "react";
import { PillChip } from "@/components/ui/PillChip";
import { Input, FieldLabel } from "@/components/ui/Input";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GOAL_TYPES } from "@/lib/constants";
import { createGoal } from "@/lib/actions/goals";

export function CreateGoalForm({ avgMonthlySurplus }: { avgMonthlySurplus: number | null }) {
  const [type, setType] = useState<(typeof GOAL_TYPES)[number]>("Emergency fund");
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const numericAmount = parseFloat(targetAmount);

  const feasibility = useMemo(() => {
    if (!numericAmount || numericAmount <= 0) return null;
    if (avgMonthlySurplus === null) {
      return "Add income and more spending data for a more accurate feasibility check.";
    }
    if (avgMonthlySurplus <= 0) {
      return "Your recent spending has outpaced income, add more data or adjust the target.";
    }
    const months = Math.ceil(numericAmount / avgMonthlySurplus);
    return `At your average monthly surplus, this could take about ${months} month${months === 1 ? "" : "s"}.`;
  }, [numericAmount, avgMonthlySurplus]);

  function handleSave() {
    setError(null);
    if (!name.trim()) {
      setError("Give your goal a name");
      return;
    }
    if (!numericAmount || numericAmount <= 0) {
      setError("Enter an amount greater than 0");
      return;
    }
    startTransition(async () => {
      const result = await createGoal({
        type,
        name: name.trim(),
        targetAmount: numericAmount,
        targetDate: targetDate || undefined,
      });
      if (result && !result.ok) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <FieldLabel>Goal type</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {GOAL_TYPES.map((t) => (
            <PillChip key={t} variant={type === t ? "active" : "inactive"} onClick={() => setType(t)}>
              {t}
            </PillChip>
          ))}
        </div>
      </div>

      <div>
        <FieldLabel>Goal name</FieldLabel>
        <Input placeholder="e.g. New laptop" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div>
        <FieldLabel>Target amount</FieldLabel>
        <Input
          type="number"
          inputMode="decimal"
          placeholder="e.g. 60000"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
        />
      </div>

      <div>
        <FieldLabel>Target date (optional)</FieldLabel>
        <DatePickerField value={targetDate} onChange={setTargetDate} />
      </div>

      {feasibility && (
        <div className="rounded-card bg-cosfy-lime-pale border border-cosfy-lime-soft p-4">
          <p className="text-[13px] font-semibold text-cosfy-lime-ink">{feasibility}</p>
        </div>
      )}

      {error ? <p className="text-[13px] text-cosfy-red">{error}</p> : null}

      <PrimaryButton fullWidth disabled={isPending} onClick={handleSave}>
        {isPending ? "Saving…" : "Set goal"}
      </PrimaryButton>
    </div>
  );
}
