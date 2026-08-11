"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { ParticipantChip } from "@/components/finance/ParticipantChip";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { useBillWizard } from "@/lib/bill-wizard-store";
import { confirmBillSplit } from "@/lib/actions/bills";

export default function AssignItemsPage() {
  const router = useRouter();
  const { merchant, items, taxAndCharges, groupId, participants, assignments, toggleAssignment, assignAllToItem, reset } =
    useBillWizard();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (items.length === 0 || participants.length < 2) {
      router.replace("/scan/edit-items");
    }
  }, [items, participants, router]);

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.quantity * i.price, 0), [items]);
  const total = subtotal + taxAndCharges;

  const perPersonPreview = useMemo(() => {
    const raw: Record<string, number> = Object.fromEntries(participants.map((p) => [p.id, 0]));
    for (const item of items) {
      const assignees = assignments[item.id] ?? [];
      if (assignees.length === 0) continue;
      const per = (item.quantity * item.price) / assignees.length;
      for (const pid of assignees) raw[pid] += per;
    }
    const taxRatio = subtotal > 0 ? taxAndCharges / subtotal : 0;
    const result: Record<string, number> = {};
    for (const p of participants) {
      result[p.id] = raw[p.id] + raw[p.id] * taxRatio;
    }
    return result;
  }, [items, assignments, participants, subtotal, taxAndCharges]);

  const allAssigned = items.every((item) => (assignments[item.id] ?? []).length > 0);

  function splitEverythingEqually() {
    for (const item of items) assignAllToItem(item.id);
  }

  function handleConfirm() {
    setError(null);
    if (!allAssigned) {
      setError("Assign every item to at least one person");
      return;
    }
    startTransition(async () => {
      const result = await confirmBillSplit({ merchant, items, taxAndCharges, groupId, participants, assignments });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const expenseId = result.groupExpenseId;
      reset();
      router.push(`/scan/split-result/${expenseId}`);
    });
  }

  return (
    <PageContainer title="Who had what?" backHref="/scan/participants">
      <div className="space-y-4">
        <button
          type="button"
          onClick={splitEverythingEqually}
          className="w-full text-center rounded-card bg-cosfy-card-soft border border-cosfy-border py-2.5 text-[13px] font-semibold text-cosfy-lime-deep"
        >
          Split everything equally instead
        </button>

        {items.map((item, index) => (
          <div key={item.id} className="rounded-card bg-cosfy-card border border-cosfy-border p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-[14px] text-cosfy-ink">
                <span className="text-cosfy-muted font-medium">{index + 1}.</span> {item.name}
              </p>
              <MoneyAmount amount={item.quantity * item.price} size="sm" />
            </div>
            <div className="flex flex-wrap gap-2">
              {participants.map((p) => (
                <ParticipantChip
                  key={p.id}
                  name={p.name}
                  selected={(assignments[item.id] ?? []).includes(p.id)}
                  onClick={() => toggleAssignment(item.id, p.id)}
                />
              ))}
              <button
                type="button"
                onClick={() => assignAllToItem(item.id)}
                className="text-[12px] font-semibold text-cosfy-lime-deep px-2"
              >
                All
              </button>
            </div>
          </div>
        ))}

        <div className="rounded-card bg-cosfy-card-soft p-4">
          <p className="text-[12px] font-semibold text-cosfy-ink-soft mb-2">Per-person total</p>
          <div className="space-y-1.5">
            {participants.map((p) => (
              <div key={p.id} className="flex justify-between text-[13px]">
                <span className="text-cosfy-ink">{p.name}</span>
                <MoneyAmount amount={perPersonPreview[p.id] ?? 0} size="sm" />
              </div>
            ))}
            <div className="flex justify-between text-[13px] font-bold pt-1 border-t border-cosfy-border">
              <span>Total</span>
              <MoneyAmount amount={total} size="sm" />
            </div>
          </div>
        </div>

        {error ? <p className="text-[13px] text-cosfy-red">{error}</p> : null}

        <PrimaryButton fullWidth disabled={!allAssigned || isPending} onClick={handleConfirm}>
          {isPending ? "Confirming…" : "Confirm split"}
        </PrimaryButton>
      </div>
    </PageContainer>
  );
}
