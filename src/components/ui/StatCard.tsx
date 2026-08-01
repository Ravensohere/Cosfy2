import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { cn } from "@/lib/cn";

export function StatCard({
  label,
  amount,
  className,
}: {
  label: string;
  amount: number;
  className?: string;
}) {
  return (
    <div className={cn("rounded-card bg-cosfy-card border border-cosfy-border px-4 py-3.5 shadow-soft", className)}>
      <p className="text-[11px] font-medium text-cosfy-muted mb-1">{label}</p>
      <MoneyAmount amount={amount} size="lg" />
    </div>
  );
}
