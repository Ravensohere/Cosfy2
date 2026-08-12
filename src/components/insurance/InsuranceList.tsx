"use client";

import { useTransition } from "react";
import type { InsurancePolicy } from "@prisma/client";
import { ShieldCheck, Trash2 } from "lucide-react";
import { RenewalRowHeader } from "@/components/ui/RenewalRowHeader";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { daysUntil, dueUrgency } from "@/lib/credit-card-status";
import { formatShortDate } from "@/lib/format";
import { markPolicyRenewed, deleteInsurancePolicy } from "@/lib/actions/insurance";

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
      <RenewalRowHeader
        icon={ShieldCheck}
        title={policy.policyName}
        subtitle={<span className="text-cosfy-muted font-normal"> · {policy.type}</span>}
        statusLine={`${URGENCY_LABEL[urgency](days)} · ${formatShortDate(policy.nextRenewalDate)}`}
        urgency={urgency}
        amount={policy.premiumAmount}
      />
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
