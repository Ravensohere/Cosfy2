"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ONBOARDING_GOALS } from "@/lib/constants";
import { saveOnboardingGoals } from "@/lib/actions/onboarding";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ProgressDots } from "@/components/onboarding/ProgressDots";
import { cn } from "@/lib/cn";

export default function OnboardingGoalPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggle(value: string) {
    setSelected((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  function handleContinue() {
    if (selected.length === 0) return;
    startTransition(async () => {
      await saveOnboardingGoals(selected);
      router.push("/onboarding/life-stage");
    });
  }

  return (
    <div className="min-h-dvh flex flex-col px-6 pt-10 pb-8 md:max-w-md md:mx-auto md:pt-16">
      <ProgressDots step={1} total={3} />
      <h1 className="text-[24px] font-extrabold mt-6 mb-1 text-cosfy-ink">What brings you here?</h1>
      <p className="text-[14px] text-cosfy-muted mb-6">Pick as many as apply — we&apos;ll tailor Cosfy around them.</p>
      <div className="flex flex-col gap-3 flex-1">
        {ONBOARDING_GOALS.map((g) => (
          <button
            key={g.value}
            type="button"
            onClick={() => toggle(g.value)}
            className={cn(
              "text-left rounded-card border-2 p-4 transition-colors bg-cosfy-card",
              selected.includes(g.value) ? "border-cosfy-lime-deep" : "border-cosfy-border"
            )}
          >
            <p className="font-bold text-[15px] text-cosfy-ink">{g.label}</p>
            <p className="text-[13px] text-cosfy-muted mt-0.5">{g.description}</p>
          </button>
        ))}
      </div>
      <PrimaryButton fullWidth disabled={selected.length === 0 || isPending} onClick={handleContinue}>
        Continue
      </PrimaryButton>
    </div>
  );
}
