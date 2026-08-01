import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { CATEGORY_ICON, type CategoryValue } from "@/lib/constants";

export function BudgetCard({
  title,
  category,
  spent,
  limit,
}: {
  title: string;
  category?: string | null;
  spent: number;
  limit: number;
}) {
  const iconName = category ? CATEGORY_ICON[category as CategoryValue] : "Wallet";
  const Icon = (Icons[iconName as keyof typeof Icons] ?? Icons.Wallet) as LucideIcon;
  const overBudget = spent > limit;

  return (
    <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4 shadow-soft">
      <div className="flex items-center gap-3 mb-3">
        <IconTile icon={Icon} tone="soft" size={40} />
        <p className="font-bold text-[14px] text-cosfy-ink flex-1">{title}</p>
      </div>
      <div className="flex items-baseline justify-between mb-2">
        <MoneyAmount amount={spent} size="md" className={overBudget ? "text-cosfy-red" : undefined} />
        <span className="text-[12px] text-cosfy-muted">of {new Intl.NumberFormat("en-IN").format(limit)}</span>
      </div>
      <ProgressBar value={spent} max={limit} />
    </div>
  );
}
