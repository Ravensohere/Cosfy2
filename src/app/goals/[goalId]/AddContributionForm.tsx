"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { addGoalContribution } from "@/lib/actions/goals";

export function AddContributionForm({ goalId }: { goalId: string }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <PrimaryButton fullWidth onClick={() => setOpen(true)}>
        Add money to goal
      </PrimaryButton>
    );
  }

  function handleAdd() {
    setError(null);
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError("Enter an amount greater than 0");
      return;
    }
    startTransition(async () => {
      const result = await addGoalContribution({ goalId, amount: numericAmount });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setAmount("");
      setOpen(false);
    });
  }

  return (
    <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4 space-y-3">
      <p className="text-[13px] text-cosfy-muted">
        This records a contribution. Cosfy does not move money.
      </p>
      <Input
        type="number"
        inputMode="decimal"
        placeholder="Amount"
        autoFocus
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      {error ? <p className="text-[13px] text-cosfy-red">{error}</p> : null}
      <div className="flex gap-2">
        <SecondaryButton className="flex-1" onClick={() => setOpen(false)} disabled={isPending}>
          Cancel
        </SecondaryButton>
        <PrimaryButton className="flex-1" onClick={handleAdd} disabled={isPending}>
          {isPending ? "Saving…" : "Add"}
        </PrimaryButton>
      </div>
    </div>
  );
}
