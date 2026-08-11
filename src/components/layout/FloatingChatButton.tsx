"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, GraduationCap, ChevronRight } from "lucide-react";
import { isCoreRoute } from "@/components/layout/nav-items";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { CosfyMascot } from "@/components/ui/CosfyMascot";
import { IconTile } from "@/components/ui/IconTile";

export function FloatingChatButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (!isCoreRoute(pathname) || pathname === "/coach" || pathname.startsWith("/coach/")) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ask Cosfy"
        data-tour="floating-ai"
        className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full bg-cosfy-ink text-cosfy-lime flex items-center justify-center shadow-soft active:opacity-80"
      >
        <Sparkles size={24} strokeWidth={2} />
      </button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title="What do you need?">
        <div className="flex flex-col gap-3">
          <MenuOption
            href="/coach"
            title="AI Coach"
            description="Chat about your spending, budgets, and goals"
            onClick={() => setOpen(false)}
          >
            <CosfyMascot mood="happy" size={48} />
          </MenuOption>
          <MenuOption
            href="/learn"
            title="Learn"
            description="Short, plain-language lessons on money basics"
            onClick={() => setOpen(false)}
          >
            <IconTile icon={GraduationCap} tone="soft" size={48} />
          </MenuOption>
        </div>
      </BottomSheet>
    </>
  );
}

function MenuOption({
  href,
  title,
  description,
  onClick,
  children,
}: {
  href: string;
  title: string;
  description: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-card bg-cosfy-card border border-cosfy-border p-3"
    >
      {children}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold text-cosfy-ink">{title}</p>
        <p className="text-[12px] text-cosfy-muted">{description}</p>
      </div>
      <ChevronRight size={18} className="text-cosfy-muted shrink-0" />
    </Link>
  );
}
