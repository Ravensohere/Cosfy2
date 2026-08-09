"use client";

import { useState, useTransition } from "react";
import { PiggyBank } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { sweepRoundUps } from "@/lib/actions/round-up";

export function SweepRoundUpsCard({
  goalId,
  goalName,
  unclaimedTotal,
}: {
  goalId: string;
  goalName: string;
  unclaimedTotal: number;
}) {
  const [swept, setSwept] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (unclaimedTotal <= 0 || swept) return null;

  function sweep() {
    startTransition(async () => {
      const result = await sweepRoundUps(goalId);
      if (result.ok) setSwept(true);
    });
  }

  return (
    <div className="flex items-center gap-3 rounded-card bg-cosfy-lime-pale border border-cosfy-lime-soft p-4">
      <IconTile icon={PiggyBank} tone="lime" size={44} />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[14px] text-cosfy-lime-ink">Round-up ready to sweep</p>
        <p className="text-[12px] text-cosfy-lime-ink/70">
          <MoneyAmount amount={unclaimedTotal} size="sm" /> saved from spare change → {goalName}
        </p>
      </div>
      <SecondaryButton className="h-9 text-[12px] px-3 shrink-0" onClick={sweep} disabled={isPending}>
        {isPending ? "…" : "Sweep"}
      </SecondaryButton>
    </div>
  );
}
