"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Home, Wallet, Target, User } from "lucide-react";
import { useQuickAdd } from "@/components/quick-add/QuickAddContext";
import { isCoreRoute } from "@/components/layout/nav-items";
import { cn } from "@/lib/cn";

const LEFT_ITEMS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/budgets", label: "Expenses", icon: Wallet },
];

const RIGHT_ITEMS = [
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/profile", label: "Profile", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { openQuickAdd } = useQuickAdd();

  if (!isCoreRoute(pathname)) return null;

  return (
    <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-[360px]">
      <div className="flex items-center justify-between bg-cosfy-card rounded-full shadow-soft border border-cosfy-border px-3 h-16">
        {LEFT_ITEMS.map((item) => (
          <NavLink key={item.href} {...item} active={pathname === item.href || pathname.startsWith(`${item.href}/`)} />
        ))}
        <button
          type="button"
          aria-label="Add expense"
          onClick={openQuickAdd}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-cosfy-lime text-cosfy-lime-ink -mt-6 shadow-soft shrink-0"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
        {RIGHT_ITEMS.map((item) => (
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
  icon: typeof Home;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "flex items-center justify-center w-10 h-10 rounded-full transition-colors",
        active ? "text-cosfy-lime-deep" : "text-cosfy-muted"
      )}
    >
      <Icon size={22} strokeWidth={active ? 2.5 : 2} />
    </Link>
  );
}
