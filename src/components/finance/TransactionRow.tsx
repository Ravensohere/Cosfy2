import { IconTile } from "@/components/ui/IconTile";
import { formatDate, formatINR } from "@/lib/format";
import { CATEGORY_ICON, type CategoryValue } from "@/lib/constants";
import { resolveIcon } from "@/lib/resolve-icon";
import { cn } from "@/lib/cn";

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
  const Icon = resolveIcon(CATEGORY_ICON[category as CategoryValue] ?? "Receipt");
  const isIncome = amount > 0;

  return (
    <div className="flex items-center gap-3 rounded-card bg-cosfy-card border border-cosfy-border p-3.5">
      <IconTile icon={Icon} tone={isIncome ? "lime" : "soft"} size={44} />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[14px] text-cosfy-ink truncate">{description}</p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className="text-[11px] font-semibold text-cosfy-ink-soft bg-cosfy-card-soft px-2 py-0.5 rounded-full">
            {paymentMode}
          </span>
          <span className="text-[11px] text-cosfy-muted">{formatDate(date)}</span>
        </div>
      </div>
      <p className={cn("text-[15px] font-extrabold shrink-0", isIncome ? "text-cosfy-green" : "text-cosfy-ink")}>
        {isIncome ? "+" : ""}
        {formatINR(amount)}
      </p>
    </div>
  );
}
