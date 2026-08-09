import Link from "next/link";
import { TrendingUp, ChevronRight } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import { MoneyAmount } from "@/components/ui/MoneyAmount";

export function NetWorthWidget({ netWorth }: { netWorth: number }) {
  return (
    <Link
      href="/net-worth"
      className="flex items-center gap-3 rounded-card bg-cosfy-card border border-cosfy-border p-4"
    >
      <IconTile icon={TrendingUp} tone="dark" size={44} />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-cosfy-muted font-semibold">Estimated net worth</p>
        <MoneyAmount amount={netWorth} size="lg" />
      </div>
      <ChevronRight size={18} className="text-cosfy-muted shrink-0" />
    </Link>
  );
}
