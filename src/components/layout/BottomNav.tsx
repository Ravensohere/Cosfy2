"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, isCoreRoute } from "@/components/layout/nav-items";
import { cn } from "@/lib/cn";

export function BottomNav() {
  const pathname = usePathname();

  if (!isCoreRoute(pathname)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-cosfy-card border-t border-cosfy-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-between max-w-2xl mx-auto">
        {NAV_LINKS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5"
            >
              <item.icon
                size={24}
                strokeWidth={active ? 2.5 : 2}
                className={active ? "text-cosfy-lime-deep" : "text-cosfy-muted"}
              />
              <span
                className={cn(
                  "text-[10px] font-semibold",
                  active ? "text-cosfy-lime-deep" : "text-cosfy-muted"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
