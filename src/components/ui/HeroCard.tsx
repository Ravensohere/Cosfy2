import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function HeroCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[22px] bg-cosfy-dark-card text-cosfy-dark-card-text p-5 shadow-soft",
        className
      )}
    >
      {children}
    </div>
  );
}
