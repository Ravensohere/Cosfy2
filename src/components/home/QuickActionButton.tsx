import Link from "next/link";
import { IconTile } from "@/components/ui/IconTile";
import { resolveIcon } from "@/lib/resolve-icon";

export function QuickActionLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2">
      <IconTile icon={resolveIcon(icon)} tone="soft" size={52} />
      <span className="text-[12px] font-semibold text-cosfy-ink-soft">{label}</span>
    </Link>
  );
}
