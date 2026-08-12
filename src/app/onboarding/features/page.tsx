"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Receipt, Target, Tag, ChevronLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CosfyMascot } from "@/components/ui/CosfyMascot";
import { DarkButton } from "@/components/ui/DarkButton";
import { ProgressDots } from "@/components/onboarding/ProgressDots";

type Card = {
  icon: LucideIcon | "mascot";
  band: string;
  title: string;
  body: string;
};

const CARDS: Card[] = [
  {
    icon: ShieldCheck,
    band: "#22221C",
    title: "Your money data, protected",
    body: "Encrypted in transit, sensitive credentials encrypted at rest, and never sold or shared with third parties. Disconnect Gmail import or delete everything from Profile, anytime.",
  },
  {
    icon: Receipt,
    band: "#33588A",
    title: "Track spending, split bills instantly",
    body: "Log expenses in seconds, scan a bill photo to split it item by item with friends, and settle up with a tap.",
  },
  {
    icon: "mascot",
    band: "#5E5790",
    title: "Meet Kosh, your AI money coach",
    body: "Ask anything about your spending, budgets, or goals, Kosh answers using your real numbers. Plus bite-sized lessons from Money School.",
  },
  {
    icon: Target,
    band: "#3C7A3E",
    title: "Goals, net worth, and more",
    body: "Set savings goals with automatic round-ups, track net worth, and manage loans, insurance, subscriptions, credit cards, and taxes, all in one place.",
  },
  {
    icon: Tag,
    band: "#A66A1B",
    title: "Never miss a coupon or a transaction",
    body: "Save coupons by photo and get warned before they expire. Connect Gmail to auto-import transactions, or share a bank SMS straight to Cosfy.",
  },
];

export default function OnboardingFeaturesPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const card = CARDS[index];
  const isLast = index === CARDS.length - 1;

  function next() {
    if (isLast) {
      router.push("/onboarding/goal");
      return;
    }
    setIndex((i) => i + 1);
  }

  function back() {
    setIndex((i) => Math.max(0, i - 1));
  }

  return (
    <div className="min-h-dvh flex flex-col px-6 pt-10 pb-8 md:max-w-md md:mx-auto md:pt-16">
      <div className="flex items-center justify-between mb-6">
        {index > 0 ? (
          <button
            type="button"
            onClick={back}
            aria-label="Back"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-cosfy-card border border-cosfy-border"
          >
            <ChevronLeft size={18} />
          </button>
        ) : (
          <div className="w-9" />
        )}
        <button
          type="button"
          onClick={() => router.push("/onboarding/goal")}
          className="text-[13px] font-semibold text-cosfy-muted"
        >
          Skip
        </button>
      </div>

      <div
        className="flex-1 rounded-[28px] flex flex-col items-center justify-center text-center px-6 py-10 mb-6"
        style={{ backgroundColor: card.band }}
      >
        {card.icon === "mascot" ? (
          <CosfyMascot mood="happy" size={88} interactive={false} />
        ) : (
          <card.icon size={64} strokeWidth={1.5} className="text-white" />
        )}
        <h1 className="text-[22px] font-extrabold text-white mt-6 mb-2">{card.title}</h1>
        <p className="text-[14px] text-white/80 leading-relaxed max-w-[280px]">{card.body}</p>
      </div>

      <div className="flex justify-center mb-5">
        <ProgressDots step={index + 1} total={CARDS.length} />
      </div>

      <DarkButton fullWidth onClick={next}>
        {isLast ? "Get started" : "Next"}
      </DarkButton>
    </div>
  );
}
