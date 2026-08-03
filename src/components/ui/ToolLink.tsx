import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";

export function ToolLink({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 h-14">
      <Icon size={18} className="text-cosfy-ink-soft shrink-0" strokeWidth={2} />
      <span className="flex-1 text-[14px] font-semibold text-cosfy-ink">{label}</span>
      <ChevronRight size={16} className="text-cosfy-muted shrink-0" />
    </Link>
  );
}
