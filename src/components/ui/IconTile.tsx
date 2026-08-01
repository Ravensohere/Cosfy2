import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type Tone = "lime" | "dark" | "soft";

const toneClasses: Record<Tone, string> = {
  lime: "bg-cosfy-lime text-cosfy-lime-ink",
  dark: "bg-cosfy-ink text-cosfy-lime",
  soft: "bg-cosfy-card-soft text-cosfy-ink-soft",
};

export function IconTile({
  icon: Icon,
  tone = "soft",
  size = 44,
  className,
}: {
  icon: LucideIcon;
  tone?: Tone;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center justify-center rounded-2xl shrink-0", toneClasses[tone], className)}
      style={{ width: size, height: size }}
    >
      <Icon size={size * 0.45} strokeWidth={2} />
    </div>
  );
}
