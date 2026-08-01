"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { IconTile } from "@/components/ui/IconTile";
import { useQuickAdd } from "@/components/quick-add/QuickAddContext";

export function QuickActionLink({ href, icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2">
      <IconTile icon={icon} tone="soft" size={52} />
      <span className="text-[12px] font-semibold text-cosfy-ink-soft">{label}</span>
    </Link>
  );
}

export function QuickActionAddExpense({ icon, label }: { icon: LucideIcon; label: string }) {
  const { openQuickAdd } = useQuickAdd();
  return (
    <button type="button" onClick={openQuickAdd} className="flex flex-col items-center gap-2">
      <IconTile icon={icon} tone="lime" size={52} />
      <span className="text-[12px] font-semibold text-cosfy-ink-soft">{label}</span>
    </button>
  );
}
