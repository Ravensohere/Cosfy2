"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Input, FieldLabel } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { savePersonalization } from "@/lib/actions/personalization";

export default function PersonalizePage() {
  const [preferredName, setPreferredName] = useState("");
  const [age, setAge] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleContinue() {
    setError(null);
    startTransition(async () => {
      const result = await savePersonalization({
        preferredName,
        age: age.trim() ? parseInt(age, 10) : undefined,
      });
      if (result && !result.ok) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="min-h-dvh flex flex-col px-6 pt-10 pb-8 md:max-w-md md:mx-auto md:pt-16">
      <h1 className="text-[24px] font-extrabold mb-1 text-cosfy-ink">What should we call you?</h1>
      <p className="text-[14px] text-cosfy-muted mb-6">You&apos;re signed in — let&apos;s personalise Cosfy a bit.</p>

      <div className="space-y-4 flex-1">
        <div>
          <FieldLabel>Preferred name</FieldLabel>
          <Input
            placeholder="e.g. Sovesh"
            value={preferredName}
            onChange={(e) => setPreferredName(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <FieldLabel>Age (optional)</FieldLabel>
          <Input type="number" placeholder="e.g. 27" value={age} onChange={(e) => setAge(e.target.value)} />
        </div>

        {error ? <p className="text-[13px] text-cosfy-red">{error}</p> : null}
      </div>

      <PrimaryButton fullWidth disabled={!preferredName.trim() || isPending} onClick={handleContinue}>
        {isPending ? "Saving…" : "Continue"}
      </PrimaryButton>

      <Link href="/coach" className="w-full text-center text-[13px] font-semibold text-cosfy-muted py-3">
        Skip for now
      </Link>
    </div>
  );
}
