"use client";

import { MessageCircle } from "lucide-react";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { formatINR } from "@/lib/format";
import { inviteLine } from "@/lib/invite-link";

export function ShareGroupUpdateButton({
  groupName,
  totalSpent,
  memberBalances,
  className,
}: {
  groupName: string;
  totalSpent: number;
  memberBalances: { name: string; balance: number }[];
  className?: string;
}) {
  const lines = memberBalances
    .filter((m) => Math.abs(m.balance) > 0.01)
    .map((m) => (m.balance > 0 ? `${m.name} is owed ${formatINR(m.balance)}` : `${m.name} owes ${formatINR(Math.abs(m.balance))}`));

  const message =
    [
      `Cosfy update for "${groupName}": ${formatINR(totalSpent)} spent so far.`,
      ...(lines.length > 0 ? lines : ["Everyone's settled up."]),
    ].join("\n") + inviteLine();

  return (
    <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className={className}>
      <SecondaryButton type="button" fullWidth className="h-11 text-[13px]">
        <MessageCircle size={16} /> Share update
      </SecondaryButton>
    </a>
  );
}
