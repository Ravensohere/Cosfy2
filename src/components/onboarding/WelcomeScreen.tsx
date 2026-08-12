"use client";

import { useEffect } from "react";
import { CosfyMascot } from "@/components/ui/CosfyMascot";

const AUTO_ADVANCE_MS = 5000;

export function WelcomeScreen({ preferredName }: { preferredName: string | null }) {
  useEffect(() => {
    // Full navigation (not router.push) so the root layout re-fetches the user
    // fresh — onboardingCompleted/tourCompleted just changed server-side, and a
    // soft client navigation here can carry a stale value into the tour's
    // shouldStart check on /home.
    const timer = setTimeout(() => {
      window.location.href = "/home";
    }, AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-cosfy-lime flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="w-28 h-28 rounded-full bg-cosfy-bg flex items-center justify-center">
        <CosfyMascot mood="happy" size={72} />
      </div>
      <div>
        <p className="text-[24px] font-extrabold text-cosfy-ink">
          {preferredName ? `Welcome, ${preferredName}!` : "Welcome to Cosfy!"}
        </p>
        <p className="text-[14px] text-cosfy-ink/70 mt-1">Let&apos;s show you around.</p>
      </div>
    </div>
  );
}
