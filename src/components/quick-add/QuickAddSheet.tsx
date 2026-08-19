"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Pencil, Camera } from "lucide-react";
import { toast } from "sonner";
import { BottomSheet, BOTTOM_SHEET_TRANSITION_MS } from "@/components/ui/BottomSheet";
import { Input } from "@/components/ui/Input";
import { PillChip } from "@/components/ui/PillChip";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { CATEGORIES, PAYMENT_MODES, CATEGORY_ICON, type CategoryValue, type PaymentModeValue } from "@/lib/constants";
import { createTransaction } from "@/lib/actions/transactions";
import { getCardOptions } from "@/lib/actions/credit-cards";
import { parseQuickAdd } from "@/lib/quick-add-parser";
import { formatINR } from "@/lib/format";
import { resolveIcon } from "@/lib/resolve-icon";
import { useT } from "@/lib/i18n/LanguageProvider";
import { ScanTransactionsPanel } from "@/components/quick-add/ScanTransactionsPanel";

const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c !== "Income");
type EntryType = "expense" | "income";
type SheetMode = "manual" | "scan";
type CardOption = { id: string; name: string; last4: string | null; kind: string };

export function QuickAddSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<SheetMode>("manual");
  const [type, setType] = useState<EntryType>("expense");
  const [text, setText] = useState("");
  const [category, setCategory] = useState<CategoryValue | null>(null);
  const [paymentMode, setPaymentMode] = useState<PaymentModeValue | null>(null);
  const [cardId, setCardId] = useState<string | null>(null);
  const [cards, setCards] = useState<CardOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useT();

  useEffect(() => {
    if (open) getCardOptions().then(setCards);
  }, [open]);

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
    setCardId(null);
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
      const description = parsed.description || (type === "income" ? "Income" : "Expense");
      const result = await createTransaction({
        amount: parsed.amount,
        description,
        category: effectiveCategory,
        paymentMode: effectivePaymentMode,
        cardId: effectivePaymentMode === "Card" && cardId ? cardId : undefined,
      });
      if (!result.ok) {
        setError(result.error ?? `Couldn't add ${type}`);
        toast.error(result.error ?? `Couldn't add ${type}`);
        return;
      }
      toast.success(`${type === "income" ? "Income" : "Expense"} added`, {
        description: `${formatINR(parsed.amount)} · ${description}`,
      });
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
          <PillChip
            variant="inactive"
            className="ml-auto"
            aria-label={mode === "manual" ? "Scan a bill or screenshot instead" : "Type manually instead"}
            onClick={() => {
              setError(null);
              setMode((m) => (m === "manual" ? "scan" : "manual"));
            }}
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
          </PillChip>
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

            {effectivePaymentMode === "Card" && cards.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {cards.map((c) => (
                  <PillChip
                    key={c.id}
                    variant={cardId === c.id ? "active" : "inactive"}
                    onClick={() => setCardId((cur) => (cur === c.id ? null : c.id))}
                  >
                    {c.name}
                    {c.last4 ? ` ••${c.last4}` : ""}
                  </PillChip>
                ))}
              </div>
            ) : null}

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
