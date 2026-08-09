"use client";

import { useTransition } from "react";
import type { Subscription } from "@prisma/client";
import { Repeat, Trash2 } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { cn } from "@/lib/cn";
import { daysUntil, dueUrgency } from "@/lib/credit-card-status";
import { markSubscriptionRenewed, deleteSubscription } from "@/lib/actions/subscriptions";

const URGENCY_STYLES = {
  overdue: "text-cosfy-red",
  soon: "text-cosfy-amber",
  upcoming: "text-cosfy-muted",
  paid: "text-cosfy-green",
};

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
      <div className="flex items-center gap-3">
        <IconTile icon={Repeat} tone="dark" size={44} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[14px] text-cosfy-ink truncate">
            {subscription.name}
            <span className="text-cosfy-muted font-normal"> · {subscription.cycle}</span>
          </p>
          <p className={cn("text-[12px] font-semibold", URGENCY_STYLES[urgency])}>
            {URGENCY_LABEL[urgency](days)} ·{" "}
            {subscription.nextRenewalDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </p>
        </div>
        <MoneyAmount amount={subscription.amount} size="md" />
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
