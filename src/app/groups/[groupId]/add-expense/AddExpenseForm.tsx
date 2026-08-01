"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Input, FieldLabel } from "@/components/ui/Input";
import { PillChip } from "@/components/ui/PillChip";
import { ParticipantChip } from "@/components/finance/ParticipantChip";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { splitEqually } from "@/lib/balances";
import { addGroupExpense } from "@/lib/actions/groups";

type Member = { id: string; name: string; isCurrentUser: boolean };

export function AddExpenseForm({ groupId, members }: { groupId: string; members: Member[] }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [splitType, setSplitType] = useState<"Equal" | "Exact" | "Percent">("Equal");
  const [paidByMemberId, setPaidByMemberId] = useState(members.find((m) => m.isCurrentUser)?.id ?? members[0]?.id);
  const [selectedIds, setSelectedIds] = useState<string[]>(members.map((m) => m.id));
  const [customShares, setCustomShares] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const numericAmount = parseFloat(amount) || 0;

  const equalPreview = useMemo(() => {
    if (splitType !== "Equal" || numericAmount <= 0 || selectedIds.length === 0) return {};
    return splitEqually(numericAmount, selectedIds);
  }, [splitType, numericAmount, selectedIds]);

  function toggleMember(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleSave() {
    setError(null);
    if (!numericAmount || numericAmount <= 0) {
      setError("Enter an amount greater than 0");
      return;
    }
    if (!description.trim()) {
      setError("Add a description");
      return;
    }
    if (!paidByMemberId) {
      setError("Choose who paid");
      return;
    }

    let shares: Record<string, number> | undefined;
    if (splitType !== "Equal") {
      shares = Object.fromEntries(
        Object.entries(customShares)
          .filter(([, v]) => v.trim() !== "")
          .map(([id, v]) => [id, parseFloat(v)])
      );
    }

    startTransition(async () => {
      const result = await addGroupExpense({
        groupId,
        description: description.trim(),
        totalAmount: numericAmount,
        paidByMemberId,
        splitType,
        shares,
        selectedMemberIds: splitType === "Equal" ? selectedIds : undefined,
      });
      if (result && !result.ok) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <FieldLabel>Amount</FieldLabel>
        <Input
          type="number"
          inputMode="decimal"
          placeholder="₹0"
          className="text-[28px] font-extrabold h-[64px]"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div>
        <FieldLabel>Description</FieldLabel>
        <Input placeholder="e.g. Dinner" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div>
        <FieldLabel>Paid by</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => (
            <ParticipantChip key={m.id} name={m.name} selected={paidByMemberId === m.id} onClick={() => setPaidByMemberId(m.id)} />
          ))}
        </div>
      </div>

      <div>
        <FieldLabel>Split type</FieldLabel>
        <div className="flex flex-wrap gap-2 mb-2">
          <PillChip variant={splitType === "Equal" ? "active" : "inactive"} onClick={() => setSplitType("Equal")}>
            Equal
          </PillChip>
          <PillChip variant={splitType === "Exact" ? "active" : "inactive"} onClick={() => setSplitType("Exact")}>
            Exact
          </PillChip>
          <PillChip variant={splitType === "Percent" ? "active" : "inactive"} onClick={() => setSplitType("Percent")}>
            Custom %
          </PillChip>
          <Link href={`/scan/edit-items?groupId=${groupId}`}>
            <PillChip variant="inactive" type="button">
              By item
            </PillChip>
          </Link>
        </div>
      </div>

      {splitType === "Equal" ? (
        <div>
          <FieldLabel>Split between</FieldLabel>
          <div className="flex flex-wrap gap-2 mb-3">
            {members.map((m) => (
              <ParticipantChip key={m.id} name={m.name} selected={selectedIds.includes(m.id)} onClick={() => toggleMember(m.id)} />
            ))}
          </div>
          <div className="space-y-1.5">
            {selectedIds.map((id) => (
              <div key={id} className="flex justify-between text-[13px]">
                <span className="text-cosfy-muted">{members.find((m) => m.id === id)?.name}</span>
                <MoneyAmount amount={equalPreview[id] ?? 0} size="sm" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <FieldLabel>{splitType === "Exact" ? "Amount per person" : "Percent per person"}</FieldLabel>
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <span className="flex-1 text-[13px] text-cosfy-ink-soft">{m.name}</span>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder={splitType === "Exact" ? "₹0" : "0%"}
                  className="w-28 h-11"
                  value={customShares[m.id] ?? ""}
                  onChange={(e) => setCustomShares((prev) => ({ ...prev, [m.id]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {error ? <p className="text-[13px] text-cosfy-red">{error}</p> : null}

      <PrimaryButton fullWidth disabled={isPending} onClick={handleSave}>
        {isPending ? "Saving…" : "Add expense"}
      </PrimaryButton>
    </div>
  );
}
