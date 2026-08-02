"use client";

import Link from "next/link";
import { IconTile } from "@/components/ui/IconTile";
import { useQuickAdd } from "@/components/quick-add/QuickAddContext";
import { resolveIcon } from "@/lib/resolve-icon";

export function QuickActionLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2">
      <IconTile icon={resolveIcon(icon)} tone="soft" size={52} />
      <span className="text-[12px] font-semibold text-cosfy-ink-soft">{label}</span>
    </Link>
  );
}

export function QuickActionAddExpense({ icon, label }: { icon: string; label: string }) {
  const { openQuickAdd } = useQuickAdd();
  return (
    <button type="button" onClick={openQuickAdd} className="flex flex-col items-center gap-2">
      <IconTile icon={resolveIcon(icon)} tone="lime" size={52} />
      <span className="text-[12px] font-semibold text-cosfy-ink-soft">{label}</span>
    </button>
  );
}
