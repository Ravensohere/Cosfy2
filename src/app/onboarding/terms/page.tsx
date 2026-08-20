"use client";

import { useState, useTransition } from "react";
import { TermsContent } from "@/components/legal/TermsContent";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { acceptTerms } from "@/lib/actions/onboarding";

export default function OnboardingTermsPage() {
  const [agreed, setAgreed] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleContinue() {
    if (!agreed) return;
    startTransition(async () => {
      await acceptTerms();
    });
  }

  return (
    <div className="min-h-dvh flex flex-col px-6 pt-10 pb-8 md:max-w-md md:mx-auto md:pt-16">
      <h1 className="text-[24px] font-extrabold mb-1 text-cosfy-ink">Terms & Conditions</h1>
      <p className="text-[14px] text-cosfy-muted mb-6">Please read and agree before continuing.</p>

      <div className="flex-1 overflow-y-auto max-h-[55dvh] rounded-card border border-cosfy-border bg-cosfy-card p-4 mb-5">
        <TermsContent />
      </div>

      <label className="flex items-start gap-3 mb-5">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="w-4 h-4 mt-0.5 accent-cosfy-lime-deep shrink-0"
        />
        <span className="text-[13px] text-cosfy-ink-soft leading-relaxed">
          I&apos;ve read and agree to Cosfy&apos;s Terms &amp; Conditions.
        </span>
      </label>

      <PrimaryButton fullWidth disabled={!agreed || isPending} onClick={handleContinue}>
        {isPending ? "Saving…" : "Agree & continue"}
      </PrimaryButton>
    </div>
  );
}
