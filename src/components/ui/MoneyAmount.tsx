import { formatINR } from "@/lib/format";
import { cn } from "@/lib/cn";

export function MoneyAmount({
  amount,
  size = "md",
  className,
}: {
  amount: number;
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
}) {
  const sizeClasses = {
    sm: "text-[13px] font-semibold",
    md: "text-[16px] font-bold",
    lg: "text-[22px] font-extrabold",
    hero: "text-[38px] font-extrabold tracking-tight",
  }[size];

  return <span className={cn(sizeClasses, className)}>{formatINR(amount)}</span>;
}
