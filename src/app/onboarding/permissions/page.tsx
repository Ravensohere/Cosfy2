"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, Bell, Camera, MessageSquareOff } from "lucide-react";
import { completeOnboarding } from "@/lib/actions/onboarding";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { IconTile } from "@/components/ui/IconTile";
import { ProgressDots } from "@/components/onboarding/ProgressDots";

export default function OnboardingPermissionsPage() {
  const [notifications, setNotifications] = useState(true);
  const [isPending, startTransition] = useTransition();

  function handleStart() {
    startTransition(async () => {
      await completeOnboarding(notifications);
    });
  }

  return (
    <div className="min-h-dvh flex flex-col px-6 pt-10 pb-8 md:max-w-md md:mx-auto md:pt-16">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/onboarding/life-stage"
          aria-label="Back"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-cosfy-card border border-cosfy-border"
        >
          <ChevronLeft size={18} />
        </Link>
        <ProgressDots step={3} total={3} />
        <div className="w-9" />
      </div>
      <h1 className="text-[24px] font-extrabold mb-1 text-cosfy-ink">Almost there</h1>
      <p className="text-[14px] text-cosfy-muted mb-6">A couple of things before we start.</p>

      <div className="flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-3 rounded-card bg-cosfy-card border border-cosfy-border p-4">
          <IconTile icon={Bell} tone="lime" size={44} />
          <div className="flex-1">
            <p className="font-bold text-[14px] text-cosfy-ink">Notifications</p>
            <p className="text-[12px] text-cosfy-muted">Budget alerts and reminders</p>
          </div>
          <ToggleSwitch checked={notifications} onChange={setNotifications} />
        </div>

        <div className="flex items-center gap-3 rounded-card bg-cosfy-card border border-cosfy-border p-4 opacity-70">
          <IconTile icon={Camera} tone="soft" size={44} />
          <div className="flex-1">
            <p className="font-bold text-[14px] text-cosfy-ink">Camera</p>
            <p className="text-[12px] text-cosfy-muted">Bills are entered manually in this version</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-card bg-cosfy-card border border-cosfy-border p-4 opacity-70">
          <IconTile icon={MessageSquareOff} tone="soft" size={44} />
          <div className="flex-1">
            <p className="font-bold text-[14px] text-cosfy-ink">SMS auto-tracking</p>
            <p className="text-[12px] text-cosfy-muted">Available later in the Android app</p>
          </div>
          <span className="text-[10px] font-bold text-cosfy-muted bg-cosfy-card-soft px-2 py-1 rounded-full">
            Mobile only
          </span>
        </div>
      </div>

      <PrimaryButton fullWidth disabled={isPending} onClick={handleStart} className="mt-4">
        {isPending ? "Setting up…" : "Start using Cosfy →"}
      </PrimaryButton>
    </div>
  );
}
