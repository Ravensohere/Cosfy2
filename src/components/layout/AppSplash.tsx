"use client";

import { useEffect, useState } from "react";
import { IndianRupee } from "lucide-react";
import { cn } from "@/lib/cn";

export function AppSplash() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 900);
    const hideTimer = setTimeout(() => setVisible(false), 1200);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] bg-cosfy-lime flex flex-col items-center justify-center gap-4 transition-opacity duration-300",
        fading ? "opacity-0" : "opacity-100"
      )}
    >
      <div className="w-20 h-20 rounded-3xl bg-cosfy-ink flex items-center justify-center animate-bounce">
        <IndianRupee size={36} className="text-cosfy-lime" strokeWidth={2.5} />
      </div>
      <span className="text-[24px] font-extrabold text-cosfy-ink lowercase tracking-tight">cosfy</span>
    </div>
  );
}
