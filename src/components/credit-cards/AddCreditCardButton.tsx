"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { BottomSheet, BOTTOM_SHEET_TRANSITION_MS } from "@/components/ui/BottomSheet";
import { Input, FieldLabel } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { createCreditCard } from "@/lib/actions/credit-cards";

export function AddCreditCardButton({ variant = "icon" }: { variant?: "icon" | "primary" }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [bank, setBank] = useState("");
  const [last4, setLast4] = useState("");
  const [statementDay, setStatementDay] = useState("1");
  const [dueDay, setDueDay] = useState("15");
  const [currentDue, setCurrentDue] = useState("");
  const [rewardPointsBalance, setRewardPointsBalance] = useState("");
  const [cashbackYtd, setCashbackYtd] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setName("");
    setBank("");
    setLast4("");
    setStatementDay("1");
    setDueDay("15");
    setCurrentDue("");
    setRewardPointsBalance("");
    setCashbackYtd("");
    setError(null);
  }

  function handleClose() {
    setOpen(false);
    setTimeout(reset, BOTTOM_SHEET_TRANSITION_MS);
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await createCreditCard({
        name: name.trim(),
        bank: bank.trim() || undefined,
        last4: last4.trim() || undefined,
        statementDay: parseInt(statementDay, 10) || 1,
        dueDay: parseInt(dueDay, 10) || 1,
        currentDue: parseFloat(currentDue) || 0,
        rewardPointsBalance: rewardPointsBalance.trim() ? parseInt(rewardPointsBalance, 10) : undefined,
        cashbackYtd: cashbackYtd.trim() ? parseFloat(cashbackYtd) : undefined,
      });
      if (!result.ok) {
        setError(result.error ?? "Couldn't add card");
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
          aria-label="Add credit card"
          onClick={() => setOpen(true)}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-cosfy-lime text-cosfy-lime-ink"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      ) : (
        <PrimaryButton type="button" onClick={() => setOpen(true)}>
          <Plus size={18} strokeWidth={2.5} /> Add a card
        </PrimaryButton>
      )}

      <BottomSheet open={open} onClose={handleClose} title="Add credit card">
        <div className="space-y-4">
          <div>
            <FieldLabel>Card name</FieldLabel>
            <Input placeholder="e.g. HDFC Regalia" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Bank</FieldLabel>
              <Input placeholder="HDFC" value={bank} onChange={(e) => setBank(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Last 4 digits</FieldLabel>
              <Input placeholder="4321" maxLength={4} value={last4} onChange={(e) => setLast4(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Statement day</FieldLabel>
              <Input type="number" min={1} max={31} placeholder="e.g. 5" value={statementDay} onChange={(e) => setStatementDay(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Due day</FieldLabel>
              <Input type="number" min={1} max={31} placeholder="e.g. 20" value={dueDay} onChange={(e) => setDueDay(e.target.value)} />
            </div>
          </div>
          <div>
            <FieldLabel>Current amount due (optional)</FieldLabel>
            <Input type="number" placeholder="0" value={currentDue} onChange={(e) => setCurrentDue(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Reward points (optional)</FieldLabel>
              <Input
                type="number"
                placeholder="0"
                value={rewardPointsBalance}
                onChange={(e) => setRewardPointsBalance(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>Cashback YTD (optional)</FieldLabel>
              <Input type="number" placeholder="0" value={cashbackYtd} onChange={(e) => setCashbackYtd(e.target.value)} />
            </div>
          </div>
          {error ? <p className="text-[13px] text-cosfy-red">{error}</p> : null}
          <PrimaryButton fullWidth type="button" disabled={isPending || !name.trim()} onClick={handleSubmit}>
            {isPending ? "Adding…" : "Add card"}
          </PrimaryButton>
        </div>
      </BottomSheet>
    </>
  );
}
