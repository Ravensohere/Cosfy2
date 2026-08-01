"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IndianRupee, Plus } from "lucide-react";
import { useQuickAdd } from "@/components/quick-add/QuickAddContext";
import { NAV_LINKS, isCoreRoute } from "@/components/layout/nav-items";
import { cn } from "@/lib/cn";

export function DesktopSidebar() {
  const pathname = usePathname();
  const { openQuickAdd } = useQuickAdd();

  if (!isCoreRoute(pathname)) return null;

  return (
    <aside className="hidden md:flex md:flex-col md:w-60 md:shrink-0 md:sticky md:top-0 md:h-dvh border-r border-cosfy-border px-5 py-6">
      <Link href="/home" className="flex items-center gap-2 mb-8 px-1">
        <div className="w-9 h-9 rounded-xl bg-cosfy-ink flex items-center justify-center">
          <IndianRupee size={18} className="text-cosfy-lime" strokeWidth={2.5} />
        </div>
        <span className="text-[20px] font-extrabold text-cosfy-ink lowercase">cosfy</span>
      </Link>

      <button
        type="button"
        onClick={openQuickAdd}
        className="flex items-center justify-center gap-2 rounded-button bg-cosfy-lime text-cosfy-lime-ink font-bold text-[14px] h-12 mb-6"
      >
        <Plus size={18} strokeWidth={2.5} /> Add expense
      </button>

      <nav className="flex flex-col gap-1">
        {NAV_LINKS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-full px-4 h-11 text-[14px] font-semibold transition-colors",
                active ? "bg-cosfy-lime-pale text-cosfy-lime-ink" : "text-cosfy-ink-soft hover:bg-cosfy-card-soft"
              )}
            >
              <item.icon size={19} strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
