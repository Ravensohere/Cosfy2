"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CosfyMascot } from "@/components/ui/CosfyMascot";

const AUTO_ADVANCE_MS = 5000;

export function WelcomeScreen({ preferredName }: { preferredName: string | null }) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.push("/home"), AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [router]);

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
