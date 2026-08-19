import { cardTheme } from "@/lib/card-theme";
import { cn } from "@/lib/cn";

export function CardVisual({
  bank,
  name,
  last4,
  network,
  kind,
  size = "default",
  className,
}: {
  bank: string | null;
  name: string;
  last4: string | null;
  network: string | null;
  kind: string;
  size?: "default" | "large";
  className?: string;
}) {
  const theme = cardTheme(bank);
  const isLarge = size === "large";

  return (
    <div
      className={cn(
        "relative w-full rounded-[18px] overflow-hidden shadow-lg",
        isLarge ? "aspect-[1.586/1] p-5" : "aspect-[1.586/1] p-4",
        className
      )}
      style={{ background: theme.gradient, color: theme.text }}
    >
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, transparent 0px, transparent 40px, #fff 40px, #fff 42px)",
        }}
      />

      <div className="relative flex items-start justify-between">
        <p className={cn("font-bold tracking-wide", isLarge ? "text-[13px]" : "text-[11px]")} style={{ opacity: 0.85 }}>
          {bank ? bank.toUpperCase() : "CARD"}
        </p>
        <span
          className={cn(
            "font-bold uppercase rounded-full px-2 py-0.5",
            isLarge ? "text-[9px]" : "text-[8px]"
          )}
          style={{ background: "rgba(255,255,255,0.15)" }}
        >
          {kind}
        </span>
      </div>

      <div className={cn("flex items-center gap-1.5", isLarge ? "mt-6" : "mt-4")}>
        <div
          className={cn("rounded-[4px]", isLarge ? "w-9 h-7" : "w-7 h-5.5")}
          style={{ background: "linear-gradient(135deg, #e8d48a 0%, #c9a94f 100%)" }}
        />
      </div>

      <p
        className={cn("font-semibold tabular-nums tracking-[0.12em]", isLarge ? "text-[19px] mt-4" : "text-[15px] mt-3")}
        style={{ opacity: 0.95 }}
      >
        •••• •••• •••• {last4 ?? "••••"}
      </p>

      <div className={cn("flex items-end justify-between", isLarge ? "mt-5" : "mt-3")}>
        <p className={cn("font-semibold truncate max-w-[65%]", isLarge ? "text-[13px]" : "text-[11px]")} style={{ opacity: 0.9 }}>
          {name}
        </p>
        <p className={cn("font-extrabold italic tracking-tight", isLarge ? "text-[16px]" : "text-[13px]")}>
          {network ?? ""}
        </p>
      </div>
    </div>
  );
}
