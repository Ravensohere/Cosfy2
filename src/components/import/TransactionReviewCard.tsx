"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/Input";
import { PillChip } from "@/components/ui/PillChip";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { CATEGORIES, PAYMENT_MODES, type CategoryValue, type PaymentModeValue } from "@/lib/constants";
import { createTransaction } from "@/lib/actions/transactions";

export function TransactionReviewCard({
  amount,
  isCredit,
  initialDescription,
  initialCategory,
  initialPaymentMode,
  onAdded,
}: {
  amount: number;
  isCredit: boolean;
  initialDescription: string;
  initialCategory: CategoryValue;
  initialPaymentMode: PaymentModeValue;
  onAdded: () => void;
}) {
  const [description, setDescription] = useState(initialDescription);
  const [category, setCategory] = useState<CategoryValue>(initialCategory);
  const [paymentMode, setPaymentMode] = useState<PaymentModeValue>(initialPaymentMode);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    setError(null);
    startTransition(async () => {
      const result = await createTransaction({
        amount,
        description: description.trim() || initialDescription,
        category,
        paymentMode,
      });
      if (!result.ok) {
        setError(result.error ?? "Couldn't add transaction");
        return;
      }
      onAdded();
    });
  }

  return (
    <div className="space-y-4 rounded-card bg-cosfy-card border border-cosfy-border p-4">
      <div>
        <p className="text-[12px] font-semibold text-cosfy-ink-soft mb-2">
          {isCredit ? "Detected: money in" : "Detected: money out"} · ₹{amount}
        </p>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
      </div>

      <div>
        <p className="text-[12px] font-semibold text-cosfy-ink-soft mb-2">Category</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <PillChip key={c} variant={category === c ? "active" : "inactive"} onClick={() => setCategory(c)}>
              {c}
            </PillChip>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[12px] font-semibold text-cosfy-ink-soft mb-2">Payment mode</p>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_MODES.map((m) => (
            <PillChip key={m} variant={paymentMode === m ? "active" : "inactive"} onClick={() => setPaymentMode(m)}>
              {m}
            </PillChip>
          ))}
        </div>
      </div>

      {error ? <p className="text-[13px] text-cosfy-red">{error}</p> : null}
      <PrimaryButton fullWidth type="button" disabled={isPending} onClick={handleAdd}>
        {isPending ? "Adding…" : "Add transaction"}
      </PrimaryButton>
    </div>
  );
}
