"use client";

import { useTransition } from "react";
import type { Subscription } from "@prisma/client";
import { Repeat, Trash2 } from "lucide-react";
import { RenewalRowHeader } from "@/components/ui/RenewalRowHeader";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { daysUntil, dueUrgency } from "@/lib/credit-card-status";
import { formatShortDate } from "@/lib/format";
import { markSubscriptionRenewed, deleteSubscription } from "@/lib/actions/subscriptions";

const URGENCY_LABEL = {
  overdue: (days: number) => `Overdue by ${Math.abs(days)}d`,
  soon: (days: number) => (days === 0 ? "Renews today" : `Renews in ${days}d`),
  upcoming: (days: number) => `Renews in ${days}d`,
  paid: () => "Renewed",
};

export function SubscriptionList({ subscriptions }: { subscriptions: Subscription[] }) {
  return (
    <div className="space-y-3">
      {subscriptions.map((sub) => (
        <SubscriptionRow key={sub.id} subscription={sub} />
      ))}
    </div>
  );
}

function SubscriptionRow({ subscription }: { subscription: Subscription }) {
  const [isPending, startTransition] = useTransition();
  const days = daysUntil(subscription.nextRenewalDate);
  const urgency = dueUrgency(days, subscription.amount);

  function renew() {
    startTransition(async () => {
      await markSubscriptionRenewed(subscription.id);
    });
  }

  function remove() {
    startTransition(async () => {
      await deleteSubscription(subscription.id);
    });
  }

  return (
    <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4">
      <RenewalRowHeader
        icon={Repeat}
        title={subscription.name}
        subtitle={<span className="text-cosfy-muted font-normal"> · {subscription.cycle}</span>}
        statusLine={`${URGENCY_LABEL[urgency](days)} · ${formatShortDate(subscription.nextRenewalDate)}`}
        urgency={urgency}
        amount={subscription.amount}
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
