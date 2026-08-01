import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { formatDate } from "@/lib/format";
import { CATEGORY_ICON, type CategoryValue } from "@/lib/constants";

export function TransactionRow({
  description,
  category,
  paymentMode,
  amount,
  date,
}: {
  description: string;
  category: string;
  paymentMode: string;
  amount: number;
  date: Date;
}) {
  const iconName = CATEGORY_ICON[category as CategoryValue] ?? "Receipt";
  const Icon = (Icons[iconName as keyof typeof Icons] ?? Icons.Receipt) as LucideIcon;
  const isIncome = amount > 0;

  return (
    <div className="flex items-center gap-3 py-3">
      <IconTile icon={Icon} tone={isIncome ? "lime" : "soft"} size={42} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[14px] text-cosfy-ink truncate">{description}</p>
        <p className="text-[12px] text-cosfy-muted">
          {category} · {paymentMode} · {formatDate(date)}
        </p>
      </div>
      <MoneyAmount amount={amount} size="md" className={isIncome ? "text-cosfy-green" : "text-cosfy-ink"} />
    </div>
  );
}
