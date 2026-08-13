"use client";

import { useEffect, useState } from "react";
import { IndianRupee } from "lucide-react";
import { cn } from "@/lib/cn";

export function AppSplash() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 1000);
    const hideTimer = setTimeout(() => setVisible(false), 1400);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] bg-cosfy-lime flex flex-col items-center justify-center gap-4",
        fading && "animate-[cosfy-splash-out_0.4s_ease-in_forwards]"
      )}
    >
      <div
        className="w-20 h-20 rounded-3xl bg-cosfy-ink flex items-center justify-center animate-[cosfy-splash-icon_0.6s_cubic-bezier(0.34,1.56,0.64,1)_forwards]"
      >
        <IndianRupee size={36} className="text-cosfy-lime" strokeWidth={2.5} />
      </div>
      <span
        className="text-[24px] font-extrabold text-cosfy-ink lowercase tracking-tight opacity-0 animate-[cosfy-splash-text_0.5s_ease-out_0.35s_forwards]"
      >
        cosfy
      </span>
      <span className="absolute bottom-8 left-0 right-0 text-center text-[12px] font-medium text-cosfy-ink/60 opacity-0 animate-[cosfy-splash-text_0.5s_ease-out_0.5s_forwards]">
        cosfy by ravenso
      </span>
    </div>
  );
}
