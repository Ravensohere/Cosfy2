import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { MoneyAmount } from "@/components/ui/MoneyAmount";

export function GoalCard({
  id,
  name,
  type,
  saved,
  target,
}: {
  id: string;
  name: string;
  type: string;
  saved: number;
  target: number;
}) {
  return (
    <Link href={`/goals/${id}`} className="block rounded-card bg-cosfy-card border border-cosfy-border p-4 shadow-soft">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-bold text-[14px] text-cosfy-ink">{name}</p>
          <p className="text-[12px] text-cosfy-muted">{type}</p>
        </div>
      </div>
      <div className="flex items-baseline justify-between mb-2">
        <MoneyAmount amount={saved} size="md" />
        <span className="text-[12px] text-cosfy-muted">of {new Intl.NumberFormat("en-IN").format(target)}</span>
      </div>
      <ProgressBar value={saved} max={target} />
    </Link>
  );
}
