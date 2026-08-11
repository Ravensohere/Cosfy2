"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useTour } from "@/components/tour/TourProvider";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ProgressDots } from "@/components/onboarding/ProgressDots";

type Rect = { top: number; left: number; width: number; height: number };

const PAD = 6;
const SAFE_MARGIN = 16;
const GAP = 14;

export function TourSpotlight() {
  const { active, stepIndex, steps, next, prev, skip, skipMissing } = useTour();
  const step = steps[stepIndex];
  const [rect, setRect] = useState<Rect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState(200);

  useEffect(() => {
    if (!active || !step) {
      setRect(null);
      return;
    }

    const el = document.querySelector<HTMLElement>(`[data-tour="${step.id}"]`);
    if (!el || (el.offsetWidth === 0 && el.offsetHeight === 0)) {
      skipMissing();
      return;
    }

    el.scrollIntoView({ behavior: "smooth", block: "center" });

    function measure() {
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    }

    measure();
    const settleTimer = setTimeout(measure, 350);
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(settleTimer);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, stepIndex]);

  useLayoutEffect(() => {
    if (cardRef.current) setCardHeight(cardRef.current.offsetHeight);
  });

  if (!active || !step || !rect) return null;

  const radius = step.radius ?? 20;
  const spotlightTop = rect.top - PAD;
  const spotlightLeft = rect.left - PAD;
  const spotlightWidth = rect.width + PAD * 2;
  const spotlightHeight = rect.height + PAD * 2;

  const viewportH = typeof window !== "undefined" ? window.innerHeight : 800;

  const belowTop = spotlightTop + spotlightHeight + GAP;
  const aboveTop = spotlightTop - GAP - cardHeight;
  const maxTop = viewportH - SAFE_MARGIN - cardHeight;

  let cardTop: number;
  if (belowTop <= maxTop) {
    cardTop = belowTop;
  } else if (aboveTop >= SAFE_MARGIN) {
    cardTop = aboveTop;
  } else {
    cardTop = belowTop;
  }
  cardTop = Math.min(Math.max(cardTop, SAFE_MARGIN), Math.max(SAFE_MARGIN, maxTop));

  return (
    <div className="fixed inset-0 z-[200]">
      <div
        className="fixed transition-all duration-300 ease-out"
        style={{
          top: spotlightTop,
          left: spotlightLeft,
          width: spotlightWidth,
          height: spotlightHeight,
          borderRadius: radius,
          boxShadow: "0 0 0 9999px rgba(28, 32, 24, 0.72)",
        }}
      />

      <div
        className="fixed left-4 right-4 z-[201] transition-all duration-300 ease-out"
        style={{ top: cardTop }}
      >
        <div
          ref={cardRef}
          className="max-w-sm mx-auto max-h-[70vh] overflow-y-auto rounded-card bg-cosfy-card border border-cosfy-border shadow-soft p-4"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <ProgressDots step={stepIndex + 1} total={steps.length} />
            <button
              type="button"
              onClick={skip}
              aria-label="Skip tour"
              className="text-cosfy-muted shrink-0 -mt-1 -mr-1 p-1"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-[15px] font-extrabold text-cosfy-ink mb-1">{step.title}</p>
          <p className="text-[13px] text-cosfy-muted leading-relaxed mb-4">{step.body}</p>
          <div className="flex items-center gap-2">
            {stepIndex > 0 ? (
              <button
                type="button"
                onClick={prev}
                className="text-[13px] font-semibold text-cosfy-muted px-3 h-[44px]"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={skip}
                className="text-[13px] font-semibold text-cosfy-muted px-3 h-[44px]"
              >
                Skip tour
              </button>
            )}
            <PrimaryButton onClick={next} fullWidth className="h-[44px] text-[13px]">
              {stepIndex + 1 === steps.length ? "Got it" : "Next"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
