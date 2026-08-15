"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Pencil, Camera } from "lucide-react";
import { BottomSheet, BOTTOM_SHEET_TRANSITION_MS } from "@/components/ui/BottomSheet";
import { Input } from "@/components/ui/Input";
import { PillChip } from "@/components/ui/PillChip";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { CATEGORIES, PAYMENT_MODES, CATEGORY_ICON, type CategoryValue, type PaymentModeValue } from "@/lib/constants";
import { createTransaction } from "@/lib/actions/transactions";
import { parseQuickAdd } from "@/lib/quick-add-parser";
import { resolveIcon } from "@/lib/resolve-icon";
import { useT } from "@/lib/i18n/LanguageProvider";
import { ScanTransactionsPanel } from "@/components/quick-add/ScanTransactionsPanel";

const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c !== "Income");
type EntryType = "expense" | "income";
type SheetMode = "manual" | "scan";

export function QuickAddSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<SheetMode>("manual");
  const [type, setType] = useState<EntryType>("expense");
  const [text, setText] = useState("");
  const [category, setCategory] = useState<CategoryValue | null>(null);
  const [paymentMode, setPaymentMode] = useState<PaymentModeValue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useT();

  const parsed = useMemo(() => parseQuickAdd(text), [text]);
  const effectiveCategory = type === "income" ? "Income" : category ?? parsed.category;
  const effectivePaymentMode = paymentMode ?? parsed.paymentMode;

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function reset() {
    setMode("manual");
    setType("expense");
    setText("");
    setCategory(null);
    setPaymentMode(null);
    setError(null);
  }

  function handleClose() {
    onClose();
    setTimeout(reset, BOTTOM_SHEET_TRANSITION_MS);
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
    <BottomSheet
      open={open}
      onClose={handleClose}
      title={mode === "scan" ? "Scan expenses" : type === "income" ? t("quickAdd.addIncome") : t("quickAdd.addExpense")}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          {mode === "manual" ? (
            <>
              <PillChip variant={type === "expense" ? "active" : "inactive"} onClick={() => selectType("expense")}>
                {t("quickAdd.expense")}
              </PillChip>
              <PillChip variant={type === "income" ? "active" : "inactive"} onClick={() => selectType("income")}>
                {t("quickAdd.income")}
              </PillChip>
            </>
          ) : null}
          <button
            type="button"
            aria-label={mode === "manual" ? "Scan a bill or screenshot instead" : "Type manually instead"}
            onClick={() => {
              setError(null);
              setMode((m) => (m === "manual" ? "scan" : "manual"));
            }}
            className="ml-auto flex items-center gap-1.5 rounded-full border border-cosfy-border px-3 h-8 text-[12px] font-semibold text-cosfy-ink-soft active:opacity-70"
          >
            {mode === "manual" ? (
              <>
                <Camera size={14} /> Scan instead
              </>
            ) : (
              <>
                <Pencil size={14} /> Type instead
              </>
            )}
          </button>
        </div>

        {mode === "scan" ? (
          <ScanTransactionsPanel onDone={handleClose} />
        ) : (
          <>
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
              {isPending ? t("quickAdd.adding") : type === "income" ? t("quickAdd.addIncome") : t("quickAdd.addExpense")}
            </PrimaryButton>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
