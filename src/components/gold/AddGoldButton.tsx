"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Input, FieldLabel, Select } from "@/components/ui/Input";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { createGoldHolding } from "@/lib/actions/gold";
import { GOLD_TYPES } from "@/lib/constants";

export function AddGoldButton({ variant = "icon" }: { variant?: "icon" | "primary" }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<(typeof GOLD_TYPES)[number]>("Digital");
  const [grams, setGrams] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setType("Digital");
    setGrams("");
    setPurchasePrice("");
    setCurrentValue("");
    setPurchaseDate(new Date().toISOString().slice(0, 10));
    setError(null);
  }

  function handleClose() {
    setOpen(false);
    setTimeout(reset, 300);
  }

  function handleSubmit() {
    setError(null);
    const price = parseFloat(purchasePrice) || 0;
    startTransition(async () => {
      const result = await createGoldHolding({
        type,
        grams: parseFloat(grams) || 0,
        purchasePrice: price,
        purchaseDate: new Date(purchaseDate),
        currentValue: currentValue.trim() ? parseFloat(currentValue) : price,
      });
      if (!result.ok) {
        setError(result.error ?? "Couldn't add holding");
        return;
      }
      handleClose();
    });
  }

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          aria-label="Add gold holding"
          onClick={() => setOpen(true)}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-cosfy-lime text-cosfy-lime-ink"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      ) : (
        <PrimaryButton type="button" onClick={() => setOpen(true)}>
          <Plus size={18} strokeWidth={2.5} /> Add gold
        </PrimaryButton>
      )}

      <BottomSheet open={open} onClose={handleClose} title="Add gold holding">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Type</FieldLabel>
              <Select value={type} onChange={(e) => setType(e.target.value as (typeof GOLD_TYPES)[number])}>
                {GOLD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <FieldLabel>Grams</FieldLabel>
              <Input type="number" placeholder="10" value={grams} onChange={(e) => setGrams(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Purchase price (total)</FieldLabel>
              <Input type="number" placeholder="65000" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Purchase date</FieldLabel>
              <DatePickerField value={purchaseDate} onChange={setPurchaseDate} />
            </div>
          </div>
          <div>
            <FieldLabel>Current value (optional)</FieldLabel>
            <Input
              type="number"
              placeholder="Same as purchase price"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
            />
          </div>
          {error ? <p className="text-[13px] text-cosfy-red">{error}</p> : null}
          <PrimaryButton fullWidth type="button" disabled={isPending || !grams.trim()} onClick={handleSubmit}>
            {isPending ? "Adding…" : "Add holding"}
          </PrimaryButton>
        </div>
      </BottomSheet>
    </>
  );
}
