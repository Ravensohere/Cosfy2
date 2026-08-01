"use client";

import { useMemo, useState, useTransition } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Input } from "@/components/ui/Input";
import { PillChip } from "@/components/ui/PillChip";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { CATEGORIES, PAYMENT_MODES, type CategoryValue, type PaymentModeValue } from "@/lib/constants";
import { createTransaction } from "@/lib/actions/transactions";
import { parseQuickAdd } from "@/lib/quick-add-parser";

export function QuickAddSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState<CategoryValue | null>(null);
  const [paymentMode, setPaymentMode] = useState<PaymentModeValue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const parsed = useMemo(() => parseQuickAdd(text), [text]);
  const effectiveCategory = category ?? parsed.category;
  const effectivePaymentMode = paymentMode ?? parsed.paymentMode;

  function reset() {
    setText("");
    setCategory(null);
    setPaymentMode(null);
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit() {
    setError(null);
    if (!parsed.amount || parsed.amount <= 0) {
      setError('Enter an amount, e.g. "chai 40"');
      return;
    }
    startTransition(async () => {
      const result = await createTransaction({
        amount: parsed.amount,
        description: parsed.description,
        category: effectiveCategory,
        paymentMode: effectivePaymentMode,
      });
      if (!result.ok) {
        setError(result.error ?? "Couldn't add expense");
        return;
      }
      handleClose();
    });
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title="Add expense">
      <div className="space-y-4">
        <Input
          autoFocus
          placeholder='Try "chai 40" or "petrol 1000 cash"'
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div>
          <p className="text-[12px] font-semibold text-cosfy-ink-soft mb-2">Category</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <PillChip
                key={c}
                variant={effectiveCategory === c ? "active" : "inactive"}
                onClick={() => setCategory(c)}
              >
                {c}
              </PillChip>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[12px] font-semibold text-cosfy-ink-soft mb-2">Payment mode</p>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_MODES.map((m) => (
              <PillChip
                key={m}
                variant={effectivePaymentMode === m ? "active" : "inactive"}
                onClick={() => setPaymentMode(m)}
              >
                {m}
              </PillChip>
            ))}
          </div>
        </div>
        {error ? <p className="text-[13px] text-cosfy-red">{error}</p> : null}
        <PrimaryButton fullWidth type="button" disabled={isPending} onClick={handleSubmit}>
          {isPending ? "Adding…" : "Add expense"}
        </PrimaryButton>
      </div>
    </BottomSheet>
  );
}
