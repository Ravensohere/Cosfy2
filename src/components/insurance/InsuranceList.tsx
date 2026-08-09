"use client";

import { useTransition } from "react";
import type { InsurancePolicy } from "@prisma/client";
import { ShieldCheck, Trash2 } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { cn } from "@/lib/cn";
import { daysUntil, dueUrgency } from "@/lib/credit-card-status";
import { markPolicyRenewed, deleteInsurancePolicy } from "@/lib/actions/insurance";

const URGENCY_STYLES = {
  overdue: "text-cosfy-red",
  soon: "text-cosfy-amber",
  upcoming: "text-cosfy-muted",
  paid: "text-cosfy-green",
};

const URGENCY_LABEL = {
  overdue: (days: number) => `Renewal overdue by ${Math.abs(days)}d`,
  soon: (days: number) => (days === 0 ? "Renews today" : `Renews in ${days}d`),
  upcoming: (days: number) => `Renews in ${days}d`,
  paid: () => "Renewed",
};

export function InsuranceList({ policies }: { policies: InsurancePolicy[] }) {
  return (
    <div className="space-y-3">
      {policies.map((policy) => (
        <PolicyRow key={policy.id} policy={policy} />
      ))}
    </div>
  );
}

function PolicyRow({ policy }: { policy: InsurancePolicy }) {
  const [isPending, startTransition] = useTransition();
  const days = daysUntil(policy.nextRenewalDate);
  const urgency = dueUrgency(days, policy.premiumAmount);

  function renew() {
    startTransition(async () => {
      await markPolicyRenewed(policy.id);
    });
  }

  function remove() {
    startTransition(async () => {
      await deleteInsurancePolicy(policy.id);
    });
  }

  return (
    <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4">
      <div className="flex items-center gap-3">
        <IconTile icon={ShieldCheck} tone="dark" size={44} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[14px] text-cosfy-ink truncate">
            {policy.policyName}
            <span className="text-cosfy-muted font-normal"> · {policy.type}</span>
          </p>
          <p className={cn("text-[12px] font-semibold", URGENCY_STYLES[urgency])}>
            {URGENCY_LABEL[urgency](days)} ·{" "}
            {policy.nextRenewalDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </p>
        </div>
        <MoneyAmount amount={policy.premiumAmount} size="md" />
      </div>
      <div className="flex gap-2 mt-3">
        <SecondaryButton className="flex-1 h-9 text-[12px]" onClick={renew} disabled={isPending}>
          Mark renewed
        </SecondaryButton>
        <SecondaryButton className="h-9 text-[12px] px-3" onClick={remove} disabled={isPending}>
          <Trash2 size={14} />
        </SecondaryButton>
      </div>
    </div>
  );
}
