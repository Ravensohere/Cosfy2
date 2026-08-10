"use client";

import { useState, useTransition } from "react";
import { MessageCircle, CheckCircle2, Scale } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconTile } from "@/components/ui/IconTile";
import { PillChip } from "@/components/ui/PillChip";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { recordSettlement } from "@/lib/actions/groups";
import { formatINR } from "@/lib/format";
import { inviteLine } from "@/lib/invite-link";

type Debt = { fromMemberId: string; fromName: string; toMemberId: string; toName: string; amount: number };

export function SettleList({ groupId, groupName, debts }: { groupId: string; groupName: string; debts: Debt[] }) {
  const [tone, setTone] = useState<"Friendly" | "Direct">("Friendly");
  const [settledKeys, setSettledKeys] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const remaining = debts.filter((d) => !settledKeys.has(`${d.fromMemberId}-${d.toMemberId}`));

  if (remaining.length === 0) {
    return <EmptyState icon={CheckCircle2} title="All settled up" description="Nothing pending in this group." />;
  }

  function message(d: Debt) {
    const base =
      tone === "Friendly"
        ? `Hey ${d.fromName} — ${formatINR(d.amount)} is pending for ${groupName}. Settle whenever works.`
        : `${d.fromName}, please settle ${formatINR(d.amount)} for ${groupName}.`;
    return base + inviteLine();
  }

  function handleRecordSettled(d: Debt) {
    startTransition(async () => {
      const result = await recordSettlement({
        groupId,
        fromMemberId: d.fromMemberId,
        toMemberId: d.toMemberId,
        amount: d.amount,
        note: "Recorded from Settle up",
      });
      if (result.ok) {
        setSettledKeys((prev) => new Set(prev).add(`${d.fromMemberId}-${d.toMemberId}`));
      }
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[12px] font-semibold text-cosfy-ink-soft mb-2">Message tone</p>
        <div className="flex gap-2">
          <PillChip variant={tone === "Friendly" ? "active" : "inactive"} onClick={() => setTone("Friendly")}>
            Friendly
          </PillChip>
          <PillChip variant={tone === "Direct" ? "active" : "inactive"} onClick={() => setTone("Direct")}>
            Direct
          </PillChip>
        </div>
      </div>

      <div className="space-y-3">
        {remaining.map((d) => (
          <div key={`${d.fromMemberId}-${d.toMemberId}`} className="rounded-card bg-cosfy-card border border-cosfy-border p-4">
            <div className="flex items-center gap-3 mb-3">
              <IconTile icon={Scale} tone="dark" size={44} />
              <p className="flex-1 min-w-0 text-[14px] text-cosfy-ink">
                <span className="font-semibold">{d.fromName}</span> owes <span className="font-semibold">{d.toName}</span>{" "}
                <MoneyAmount amount={d.amount} size="sm" />
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(message(d))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <SecondaryButton type="button" fullWidth className="h-11 text-[13px]">
                  <MessageCircle size={16} /> WhatsApp
                </SecondaryButton>
              </a>
              <SecondaryButton
                type="button"
                className="flex-1 h-11 text-[13px]"
                fullWidth
                disabled={isPending}
                onClick={() => handleRecordSettled(d)}
              >
                Record as settled
              </SecondaryButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
