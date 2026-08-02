"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { useQuickAdd } from "@/components/quick-add/QuickAddContext";
import { LEFT_NAV_ITEMS, RIGHT_NAV_ITEMS, isCoreRoute } from "@/components/layout/nav-items";
import { cn } from "@/lib/cn";

export function BottomNav() {
  const pathname = usePathname();
  const { openQuickAdd } = useQuickAdd();

  if (!isCoreRoute(pathname)) return null;

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-sm mb-[env(safe-area-inset-bottom)]">
      <div className="flex items-end justify-between bg-cosfy-card rounded-full shadow-soft border border-cosfy-border px-3 pb-2.5 h-16">
        {LEFT_NAV_ITEMS.map((item) => (
          <NavLink key={item.href} {...item} active={pathname === item.href || pathname.startsWith(`${item.href}/`)} />
        ))}

        <button
          type="button"
          aria-label="Add expense"
          onClick={openQuickAdd}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-cosfy-lime text-cosfy-lime-ink -mt-6 shadow-soft shrink-0"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>

        {RIGHT_NAV_ITEMS.map((item) => (
          <NavLink key={item.href} {...item} active={pathname === item.href || pathname.startsWith(`${item.href}/`)} />
        ))}
      </div>
    </nav>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: typeof Plus;
  label: string;
  active: boolean;
}) {
  return (
    <Link href={href} aria-label={label} className="flex-1 flex flex-col items-center justify-center gap-0.5">
      <Icon size={20} strokeWidth={active ? 2.5 : 2} className={active ? "text-cosfy-lime-deep" : "text-cosfy-muted"} />
      <span className={cn("text-[9px] font-semibold", active ? "text-cosfy-lime-deep" : "text-cosfy-muted")}>
        {label}
      </span>
    </Link>
  );
}
