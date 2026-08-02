"use client";

import { useMemo, useState, useTransition } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Input } from "@/components/ui/Input";
import { PillChip } from "@/components/ui/PillChip";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { CATEGORIES, PAYMENT_MODES, type CategoryValue, type PaymentModeValue } from "@/lib/constants";
import { createTransaction } from "@/lib/actions/transactions";
import { parseQuickAdd } from "@/lib/quick-add-parser";

const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c !== "Income");
type EntryType = "expense" | "income";

export function QuickAddSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [type, setType] = useState<EntryType>("expense");
  const [text, setText] = useState("");
  const [category, setCategory] = useState<CategoryValue | null>(null);
  const [paymentMode, setPaymentMode] = useState<PaymentModeValue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const parsed = useMemo(() => parseQuickAdd(text), [text]);
  const effectiveCategory = type === "income" ? "Income" : category ?? parsed.category;
  const effectivePaymentMode = paymentMode ?? parsed.paymentMode;

  function reset() {
    setType("expense");
    setText("");
    setCategory(null);
    setPaymentMode(null);
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function selectType(next: EntryType) {
    setType(next);
    setCategory(null);
    setError(null);
  }

  function handleSubmit() {
    setError(null);
    if (!parsed.amount || parsed.amount <= 0) {
      setError(type === "income" ? 'Enter an amount, e.g. "salary 50000"' : 'Enter an amount, e.g. "chai 40"');
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
        setError(result.error ?? `Couldn't add ${type}`);
        return;
      }
      handleClose();
    });
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title={type === "income" ? "Add income" : "Add expense"}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <PillChip variant={type === "expense" ? "active" : "inactive"} onClick={() => selectType("expense")}>
            Expense
          </PillChip>
          <PillChip variant={type === "income" ? "active" : "inactive"} onClick={() => selectType("income")}>
            Income
          </PillChip>
        </div>
        <Input
          autoFocus
          placeholder={type === "income" ? 'Try "salary 50000" or "freelance 8000"' : 'Try "chai 40" or "petrol 1000 cash"'}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {type === "expense" ? (
          <div>
            <p className="text-[12px] font-semibold text-cosfy-ink-soft mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {EXPENSE_CATEGORIES.map((c) => (
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
        ) : null}
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
          {isPending ? "Adding…" : type === "income" ? "Add income" : "Add expense"}
        </PrimaryButton>
      </div>
    </BottomSheet>
  );
}
