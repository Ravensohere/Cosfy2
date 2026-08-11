"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Input, FieldLabel, Select } from "@/components/ui/Input";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { createInsurancePolicy } from "@/lib/actions/insurance";
import { INSURANCE_TYPES, INSURANCE_FREQUENCIES } from "@/lib/constants";

function defaultRenewalDate() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

export function AddPolicyButton({ variant = "icon" }: { variant?: "icon" | "primary" }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<(typeof INSURANCE_TYPES)[number]>("Health");
  const [provider, setProvider] = useState("");
  const [policyName, setPolicyName] = useState("");
  const [premiumAmount, setPremiumAmount] = useState("");
  const [frequency, setFrequency] = useState<(typeof INSURANCE_FREQUENCIES)[number]>("Yearly");
  const [nextRenewalDate, setNextRenewalDate] = useState(defaultRenewalDate());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setType("Health");
    setProvider("");
    setPolicyName("");
    setPremiumAmount("");
    setFrequency("Yearly");
    setNextRenewalDate(defaultRenewalDate());
    setError(null);
  }

  function handleClose() {
    setOpen(false);
    setTimeout(reset, 300);
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await createInsurancePolicy({
        type,
        provider: provider.trim() || undefined,
        policyName: policyName.trim(),
        premiumAmount: parseFloat(premiumAmount) || 0,
        frequency,
        nextRenewalDate: new Date(nextRenewalDate),
      });
      if (!result.ok) {
        setError(result.error ?? "Couldn't add policy");
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
          aria-label="Add policy"
          onClick={() => setOpen(true)}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-cosfy-lime text-cosfy-lime-ink"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      ) : (
        <PrimaryButton type="button" onClick={() => setOpen(true)}>
          <Plus size={18} strokeWidth={2.5} /> Add a policy
        </PrimaryButton>
      )}

      <BottomSheet open={open} onClose={handleClose} title="Add insurance policy">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Type</FieldLabel>
              <Select value={type} onChange={(e) => setType(e.target.value as (typeof INSURANCE_TYPES)[number])}>
                {INSURANCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <FieldLabel>Frequency</FieldLabel>
              <Select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as (typeof INSURANCE_FREQUENCIES)[number])}
              >
                {INSURANCE_FREQUENCIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <FieldLabel>Policy name</FieldLabel>
            <Input placeholder="e.g. Family floater" value={policyName} onChange={(e) => setPolicyName(e.target.value)} />
          </div>
          <div>
            <FieldLabel>Provider (optional)</FieldLabel>
            <Input placeholder="HDFC Ergo" value={provider} onChange={(e) => setProvider(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Premium amount</FieldLabel>
              <Input type="number" placeholder="12000" value={premiumAmount} onChange={(e) => setPremiumAmount(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Next renewal date</FieldLabel>
              <DatePickerField value={nextRenewalDate} onChange={setNextRenewalDate} />
            </div>
          </div>
          {error ? <p className="text-[13px] text-cosfy-red">{error}</p> : null}
          <PrimaryButton fullWidth type="button" disabled={isPending || !policyName.trim()} onClick={handleSubmit}>
            {isPending ? "Adding…" : "Add policy"}
          </PrimaryButton>
        </div>
      </BottomSheet>
    </>
  );
}
