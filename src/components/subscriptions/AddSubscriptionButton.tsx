"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Input, FieldLabel, Select } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { createSubscription } from "@/lib/actions/subscriptions";
import { SUBSCRIPTION_CYCLES } from "@/lib/constants";

function defaultRenewalDate() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

export function AddSubscriptionButton({ variant = "icon" }: { variant?: "icon" | "primary" }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [cycle, setCycle] = useState<(typeof SUBSCRIPTION_CYCLES)[number]>("Monthly");
  const [nextRenewalDate, setNextRenewalDate] = useState(defaultRenewalDate());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setName("");
    setAmount("");
    setCycle("Monthly");
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
      const result = await createSubscription({
        name: name.trim(),
        amount: parseFloat(amount) || 0,
        cycle,
        nextRenewalDate: new Date(nextRenewalDate),
        source: "manual",
      });
      if (!result.ok) {
        setError(result.error ?? "Couldn't add subscription");
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
          aria-label="Add subscription"
          onClick={() => setOpen(true)}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-cosfy-lime text-cosfy-lime-ink"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      ) : (
        <PrimaryButton type="button" onClick={() => setOpen(true)}>
          <Plus size={18} strokeWidth={2.5} /> Add subscription
        </PrimaryButton>
      )}

      <BottomSheet open={open} onClose={handleClose} title="Add subscription">
        <div className="space-y-4">
          <div>
            <FieldLabel>Name</FieldLabel>
            <Input placeholder="e.g. Netflix" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Amount</FieldLabel>
              <Input type="number" placeholder="499" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Cycle</FieldLabel>
              <Select value={cycle} onChange={(e) => setCycle(e.target.value as (typeof SUBSCRIPTION_CYCLES)[number])}>
                {SUBSCRIPTION_CYCLES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <FieldLabel>Next renewal date</FieldLabel>
            <Input type="date" value={nextRenewalDate} onChange={(e) => setNextRenewalDate(e.target.value)} />
          </div>
          {error ? <p className="text-[13px] text-cosfy-red">{error}</p> : null}
          <PrimaryButton fullWidth type="button" disabled={isPending || !name.trim()} onClick={handleSubmit}>
            {isPending ? "Adding…" : "Add subscription"}
          </PrimaryButton>
        </div>
      </BottomSheet>
    </>
  );
}
