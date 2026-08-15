"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { BottomSheet, BOTTOM_SHEET_TRANSITION_MS } from "@/components/ui/BottomSheet";
import { Input, FieldLabel } from "@/components/ui/Input";
import { PillChip } from "@/components/ui/PillChip";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { CATEGORIES, PAYMENT_MODES, type CategoryValue, type PaymentModeValue } from "@/lib/constants";
import { updateTransaction, deleteTransaction } from "@/lib/actions/transactions";

export function EditTransactionSheet({
  open,
  onClose,
  id,
  initialDescription,
  initialAmount,
  initialCategory,
  initialPaymentMode,
}: {
  open: boolean;
  onClose: () => void;
  id: string;
  initialDescription: string;
  initialAmount: number;
  initialCategory: CategoryValue;
  initialPaymentMode: PaymentModeValue;
}) {
  const [description, setDescription] = useState(initialDescription);
  const [amount, setAmount] = useState(String(Math.abs(initialAmount)));
  const [category, setCategory] = useState<CategoryValue>(initialCategory);
  const [paymentMode, setPaymentMode] = useState<PaymentModeValue>(initialPaymentMode);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setDescription(initialDescription);
    setAmount(String(Math.abs(initialAmount)));
    setCategory(initialCategory);
    setPaymentMode(initialPaymentMode);
    setError(null);
    setConfirmingDelete(false);
  }

  function handleClose() {
    onClose();
    setTimeout(reset, BOTTOM_SHEET_TRANSITION_MS);
  }

  function handleSave() {
    setError(null);
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError("Enter an amount");
      return;
    }
    startTransition(async () => {
      const result = await updateTransaction(id, {
        amount: parsedAmount,
        description: description.trim(),
        category,
        paymentMode,
      });
      if (!result.ok) {
        setError(result.error ?? "Couldn't save changes");
        return;
      }
      handleClose();
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteTransaction(id);
      if (!result.ok) {
        setError(result.error ?? "Couldn't delete transaction");
        return;
      }
      handleClose();
    });
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title="Edit transaction">
      <div className="space-y-4">
        <div>
          <FieldLabel>Description</FieldLabel>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
        </div>

        <div>
          <FieldLabel>Amount</FieldLabel>
          <Input type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
        </div>

        <div>
          <FieldLabel>Category</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <PillChip key={c} variant={category === c ? "active" : "inactive"} onClick={() => setCategory(c)}>
                {c}
              </PillChip>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Payment mode</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_MODES.map((m) => (
              <PillChip key={m} variant={paymentMode === m ? "strong" : "inactive"} onClick={() => setPaymentMode(m)}>
                {m}
              </PillChip>
            ))}
          </div>
        </div>

        {error ? <p className="text-[13px] text-cosfy-red">{error}</p> : null}

        <PrimaryButton fullWidth type="button" disabled={isPending} onClick={handleSave}>
          {isPending ? "Saving…" : "Save changes"}
        </PrimaryButton>

        <div className="rounded-card bg-cosfy-red-soft border border-cosfy-red/20 p-4">
          <div className="mb-3">
            <p className="font-bold text-[14px] text-cosfy-ink">Delete transaction</p>
            <p className="text-[12px] text-cosfy-muted">This can&apos;t be undone</p>
          </div>
          {confirmingDelete ? (
            <div className="flex gap-2">
              <SecondaryButton className="flex-1 h-10 text-[13px]" onClick={() => setConfirmingDelete(false)} disabled={isPending}>
                Cancel
              </SecondaryButton>
              <SecondaryButton
                className="flex-1 h-10 text-[13px] border-cosfy-red text-cosfy-red"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? "Deleting…" : "Yes, delete"}
              </SecondaryButton>
            </div>
          ) : (
            <SecondaryButton fullWidth className="h-10 text-[13px]" onClick={() => setConfirmingDelete(true)} disabled={isPending}>
              <Trash2 size={14} /> Delete transaction
            </SecondaryButton>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
