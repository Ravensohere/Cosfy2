"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { BottomSheet, BOTTOM_SHEET_TRANSITION_MS } from "@/components/ui/BottomSheet";
import { Input, FieldLabel } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { createLoan } from "@/lib/actions/loans";

export function AddLoanButton({ variant = "icon" }: { variant?: "icon" | "primary" }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [lender, setLender] = useState("");
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [tenureMonths, setTenureMonths] = useState("");
  const [emiAmount, setEmiAmount] = useState("");
  const [dueDay, setDueDay] = useState("5");
  const [outstandingPrincipal, setOutstandingPrincipal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setName("");
    setLender("");
    setPrincipal("");
    setInterestRate("");
    setTenureMonths("");
    setEmiAmount("");
    setDueDay("5");
    setOutstandingPrincipal("");
    setError(null);
  }

  function handleClose() {
    setOpen(false);
    setTimeout(reset, BOTTOM_SHEET_TRANSITION_MS);
  }

  function handleSubmit() {
    setError(null);
    const parsedPrincipal = parseFloat(principal) || 0;
    startTransition(async () => {
      const result = await createLoan({
        name: name.trim(),
        lender: lender.trim() || undefined,
        principal: parsedPrincipal,
        interestRate: parseFloat(interestRate) || 0,
        tenureMonths: parseInt(tenureMonths, 10) || 1,
        emiAmount: parseFloat(emiAmount) || 0,
        startDate: new Date(),
        dueDay: parseInt(dueDay, 10) || 1,
        outstandingPrincipal: outstandingPrincipal.trim() ? parseFloat(outstandingPrincipal) : parsedPrincipal,
      });
      if (!result.ok) {
        setError(result.error ?? "Couldn't add loan");
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
          aria-label="Add loan"
          onClick={() => setOpen(true)}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-cosfy-lime text-cosfy-lime-ink"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      ) : (
        <PrimaryButton type="button" onClick={() => setOpen(true)}>
          <Plus size={18} strokeWidth={2.5} /> Add a loan
        </PrimaryButton>
      )}

      <BottomSheet open={open} onClose={handleClose} title="Add loan / EMI">
        <div className="space-y-4">
          <div>
            <FieldLabel>Loan name</FieldLabel>
            <Input placeholder="e.g. Home loan" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <FieldLabel>Lender (optional)</FieldLabel>
            <Input placeholder="SBI" value={lender} onChange={(e) => setLender(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Principal amount</FieldLabel>
              <Input type="number" placeholder="500000" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Interest rate (%)</FieldLabel>
              <Input type="number" placeholder="8.5" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Tenure (months)</FieldLabel>
              <Input type="number" placeholder="60" value={tenureMonths} onChange={(e) => setTenureMonths(e.target.value)} />
            </div>
            <div>
              <FieldLabel>EMI amount</FieldLabel>
              <Input type="number" placeholder="10500" value={emiAmount} onChange={(e) => setEmiAmount(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>EMI due day</FieldLabel>
              <Input type="number" min={1} max={31} value={dueDay} onChange={(e) => setDueDay(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Outstanding (optional)</FieldLabel>
              <Input
                type="number"
                placeholder="Same as principal"
                value={outstandingPrincipal}
                onChange={(e) => setOutstandingPrincipal(e.target.value)}
              />
            </div>
          </div>
          {error ? <p className="text-[13px] text-cosfy-red">{error}</p> : null}
          <PrimaryButton fullWidth type="button" disabled={isPending || !name.trim()} onClick={handleSubmit}>
            {isPending ? "Adding…" : "Add loan"}
          </PrimaryButton>
        </div>
      </BottomSheet>
    </>
  );
}
