"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { isCoreRoute } from "@/components/layout/nav-items";

export function FloatingChatButton() {
  const pathname = usePathname();

  if (!isCoreRoute(pathname) || pathname === "/coach" || pathname.startsWith("/coach/")) return null;

  return (
    <Link
      href="/coach"
      aria-label="Ask AI"
      className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full bg-cosfy-ink text-cosfy-lime flex items-center justify-center shadow-soft active:opacity-80"
    >
      <Sparkles size={24} strokeWidth={2} />
    </Link>
  );
}
