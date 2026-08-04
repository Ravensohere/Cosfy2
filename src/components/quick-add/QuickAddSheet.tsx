"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Input } from "@/components/ui/Input";
import { PillChip } from "@/components/ui/PillChip";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { CATEGORIES, PAYMENT_MODES, CATEGORY_ICON, type CategoryValue, type PaymentModeValue } from "@/lib/constants";
import { createTransaction } from "@/lib/actions/transactions";
import { parseQuickAdd } from "@/lib/quick-add-parser";
import { resolveIcon } from "@/lib/resolve-icon";

const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c !== "Income");
type EntryType = "expense" | "income";

export function QuickAddSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [type, setType] = useState<EntryType>("expense");
  const [text, setText] = useState("");
  const [category, setCategory] = useState<CategoryValue | null>(null);
  const [paymentMode, setPaymentMode] = useState<PaymentModeValue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => parseQuickAdd(text), [text]);
  const effectiveCategory = type === "income" ? "Income" : category ?? parsed.category;
  const effectivePaymentMode = paymentMode ?? parsed.paymentMode;

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function reset() {
    setType("expense");
    setText("");
    setCategory(null);
    setPaymentMode(null);
    setError(null);
  }

  function handleClose() {
    onClose();
    setTimeout(reset, 300);
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
        description: parsed.description || (type === "income" ? "Income" : "Expense"),
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

        <div className="relative">
          <Pencil size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cosfy-muted pointer-events-none" />
          <Input
            ref={inputRef}
            placeholder={type === "income" ? 'Try "salary 50000" or "freelance 8000"' : 'Try "chai 40" or "petrol 1000 cash"'}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="pl-10"
          />
        </div>

        {type === "expense" ? (
          <div className="flex flex-wrap gap-2">
            {EXPENSE_CATEGORIES.map((c) => {
              const Icon = resolveIcon(CATEGORY_ICON[c]);
              return (
                <PillChip
                  key={c}
                  variant={effectiveCategory === c ? "active" : "inactive"}
                  onClick={() => setCategory(c)}
                >
                  <Icon size={14} />
                  {c}
                </PillChip>
              );
            })}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {PAYMENT_MODES.map((m) => (
            <PillChip
              key={m}
              variant={effectivePaymentMode === m ? "strong" : "inactive"}
              onClick={() => setPaymentMode(m)}
            >
              {m}
            </PillChip>
          ))}
        </div>

        {error ? <p className="text-[13px] text-cosfy-red">{error}</p> : null}
        <PrimaryButton fullWidth type="button" disabled={isPending} onClick={handleSubmit}>
          {isPending ? "Adding…" : type === "income" ? "Add income" : "Add expense"}
        </PrimaryButton>
      </div>
    </BottomSheet>
  );
}
