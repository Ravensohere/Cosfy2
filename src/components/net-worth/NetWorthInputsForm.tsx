"use client";

import { useState, useTransition } from "react";
import { Input, FieldLabel } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { updateNetWorthInputs } from "@/lib/actions/net-worth";

export function NetWorthInputsForm({
  bankBalance,
  otherInvestments,
  epfBalance,
}: {
  bankBalance: number | null;
  otherInvestments: number | null;
  epfBalance: number | null;
}) {
  const [bank, setBank] = useState(bankBalance != null ? String(bankBalance) : "");
  const [investments, setInvestments] = useState(otherInvestments != null ? String(otherInvestments) : "");
  const [epf, setEpf] = useState(epfBalance != null ? String(epfBalance) : "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save() {
    setSaved(false);
    startTransition(async () => {
      await updateNetWorthInputs({
        bankBalance: bank.trim() ? parseFloat(bank) : undefined,
        otherInvestments: investments.trim() ? parseFloat(investments) : undefined,
        epfBalance: epf.trim() ? parseFloat(epf) : undefined,
      });
      setSaved(true);
    });
  }

  return (
    <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4">
      <h2 className="text-[13px] font-bold text-cosfy-ink mb-3">Update manual balances</h2>
      <div className="space-y-3">
        <div>
          <FieldLabel>Bank balance</FieldLabel>
          <Input type="number" placeholder="0" value={bank} onChange={(e) => setBank(e.target.value)} />
        </div>
        <div>
          <FieldLabel>Other investments (stocks, MFs)</FieldLabel>
          <Input type="number" placeholder="0" value={investments} onChange={(e) => setInvestments(e.target.value)} />
        </div>
        <div>
          <FieldLabel>EPF / PF balance</FieldLabel>
          <Input type="number" placeholder="0" value={epf} onChange={(e) => setEpf(e.target.value)} />
        </div>
        <PrimaryButton fullWidth type="button" disabled={isPending} onClick={save}>
          {isPending ? "Saving…" : saved ? "Saved" : "Save balances"}
        </PrimaryButton>
      </div>
    </div>
  );
}
