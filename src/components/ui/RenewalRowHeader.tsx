import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { cn } from "@/lib/cn";
import { URGENCY_STYLES, type DueUrgency } from "@/lib/credit-card-status";

/**
 * Shared icon/title/status/amount header used by every renewal-tracking list row
 * (credit cards, loans, insurance, subscriptions). `subtitle` is passed as a fully
 * pre-styled node since each caller uses its own separator/optional-field rules.
 */
export function RenewalRowHeader({
  icon,
  title,
  subtitle,
  statusLine,
  urgency,
  amount,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: ReactNode;
  statusLine: string;
  urgency: DueUrgency;
  amount: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <IconTile icon={icon} tone="dark" size={44} />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[14px] text-cosfy-ink truncate">
          {title}
          {subtitle}
        </p>
        <p className={cn("text-[12px] font-semibold", URGENCY_STYLES[urgency])}>{statusLine}</p>
      </div>
      <MoneyAmount amount={amount} size="md" />
    </div>
  );
}
