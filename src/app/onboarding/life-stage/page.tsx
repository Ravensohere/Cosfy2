"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { LIFE_STAGES } from "@/lib/constants";
import { saveLifeStage } from "@/lib/actions/onboarding";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ProgressDots } from "@/components/onboarding/ProgressDots";
import { cn } from "@/lib/cn";

export default function OnboardingLifeStagePage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleContinue() {
    if (!selected) return;
    startTransition(async () => {
      await saveLifeStage(selected);
      router.push("/onboarding/permissions");
    });
  }

  return (
    <div className="min-h-dvh flex flex-col px-6 pt-10 pb-8 md:max-w-md md:mx-auto md:pt-16">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/onboarding/goal"
          aria-label="Back"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-cosfy-card border border-cosfy-border"
        >
          <ChevronLeft size={18} />
        </Link>
        <ProgressDots step={2} total={3} />
        <div className="w-9" />
      </div>
      <h1 className="text-[24px] font-extrabold mb-1 text-cosfy-ink">Where are you in life?</h1>
      <p className="text-[14px] text-cosfy-muted mb-6">This helps us tailor budgets and tips.</p>
      <div className="grid grid-cols-2 gap-3 flex-1">
        {LIFE_STAGES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setSelected(s.value)}
            className={cn(
              "text-left rounded-card border-2 p-4 transition-colors bg-cosfy-card",
              selected === s.value ? "border-cosfy-lime-deep" : "border-cosfy-border"
            )}
          >
            <p className="font-bold text-[14px] text-cosfy-ink">{s.label}</p>
            <p className="text-[12px] text-cosfy-muted mt-0.5">{s.description}</p>
          </button>
        ))}
      </div>
      <PrimaryButton fullWidth disabled={!selected || isPending} onClick={handleContinue} className="mt-4">
        Continue
      </PrimaryButton>
    </div>
  );
}
