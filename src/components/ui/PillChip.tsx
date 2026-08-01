import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "inactive" | "active" | "strong" | "disabled";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const variantClasses: Record<Variant, string> = {
  inactive: "bg-cosfy-card-soft text-cosfy-ink border border-cosfy-border",
  active: "bg-cosfy-lime text-cosfy-lime-ink border border-cosfy-lime",
  strong: "bg-cosfy-ink text-cosfy-lime border border-cosfy-ink",
  disabled: "bg-cosfy-card-soft text-cosfy-muted border border-cosfy-border opacity-50 pointer-events-none",
};

export function PillChip({ variant = "inactive", className, ...props }: Props) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-4 h-9 text-[13px] font-semibold whitespace-nowrap transition-colors",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
