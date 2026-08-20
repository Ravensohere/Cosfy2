import Link from "next/link";
import type { LucideIcon } from "lucide-react";

const BAND_COLORS = ["#33588A", "#5E5790", "#3C7A3E", "#A66A1B"];

export function ToolCard({
  href,
  icon: Icon,
  label,
  description,
  index,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  description: string;
  index: number;
}) {
  const band = BAND_COLORS[index % BAND_COLORS.length];

  return (
    <Link
      href={href}
      className="block rounded-card border border-cosfy-border overflow-hidden bg-cosfy-card active:opacity-80"
    >
      <div className="p-3 pb-4" style={{ backgroundColor: band }}>
        <Icon size={20} className="text-white" strokeWidth={2} />
      </div>
      <div className="p-3">
        <p className="text-[13px] font-bold text-cosfy-ink leading-snug">{label}</p>
        <p className="text-[11px] text-cosfy-muted mt-1 line-clamp-2 leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}
