"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export type MascotMood = "neutral" | "happy" | "concerned" | "thinking";

const MOUTHS: Record<MascotMood, string> = {
  happy: "M15 30q7 6 14 0",
  neutral: "M15 31h14",
  concerned: "M15 33q7 -6 14 0",
  thinking: "",
};

const BROWS: Record<MascotMood, string> = {
  happy: "",
  neutral: "",
  concerned: "M15 15l6 2M29 15l-6 2",
  thinking: "",
};

const BOB_CLASS: Record<MascotMood, string> = {
  happy: "cosfy-mascot-bob-happy",
  neutral: "cosfy-mascot-bob",
  concerned: "cosfy-mascot-bob-concerned",
  thinking: "cosfy-mascot-bob-thinking",
};

export function CosfyMascot({
  mood = "neutral",
  size = 44,
  interactive = true,
}: {
  mood?: MascotMood;
  size?: number;
  interactive?: boolean;
}) {
  const [tapped, setTapped] = useState(false);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
      role={interactive ? "button" : undefined}
      aria-hidden={!interactive}
      onClick={
        interactive
          ? () => {
              setTapped(true);
              setTimeout(() => setTapped(false), 400);
            }
          : undefined
      }
      className={interactive ? "cursor-pointer" : undefined}
    >
      <g className={cn(BOB_CLASS[mood], tapped && "cosfy-mascot-tap")}>
        <circle cx="22" cy="22" r="21" fill="var(--color-cosfy-lime)" />
        <circle cx="22" cy="22" r="21" fill="none" stroke="var(--color-cosfy-lime-deep)" strokeWidth="1" opacity="0.4" />

        <path
          d="M32.5 7.5l1 2.4 2.4 1-2.4 1 -1 2.4-1-2.4-2.4-1 2.4-1z"
          fill="var(--color-cosfy-lime-deep)"
          opacity="0.5"
        />

        <ellipse cx="12" cy="25.5" rx="3" ry="1.8" fill="var(--color-cosfy-lime-deep)" opacity="0.3" />
        <ellipse cx="32" cy="25.5" rx="3" ry="1.8" fill="var(--color-cosfy-lime-deep)" opacity="0.3" />

        {BROWS[mood] ? (
          <path d={BROWS[mood]} stroke="var(--color-cosfy-lime-ink)" strokeWidth="1.6" strokeLinecap="round" />
        ) : null}

        <g className={mood === "thinking" ? "cosfy-mascot-eye-thinking" : "cosfy-mascot-eye"}>
          <circle cx="15" cy="20" r="3" fill="var(--color-cosfy-lime-ink)" />
          <circle cx="13.9" cy="18.9" r="0.9" fill="var(--color-cosfy-lime)" />
        </g>
        <g className={mood === "thinking" ? "cosfy-mascot-eye-thinking" : "cosfy-mascot-eye"}>
          <circle cx="29" cy="20" r="3" fill="var(--color-cosfy-lime-ink)" />
          <circle cx="27.9" cy="18.9" r="0.9" fill="var(--color-cosfy-lime)" />
        </g>

        {mood === "thinking" ? (
          <ellipse cx="23" cy="31" rx="2.6" ry="2" fill="var(--color-cosfy-lime-ink)" />
        ) : (
          <path
            d={MOUTHS[mood]}
            stroke="var(--color-cosfy-lime-ink)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        )}
      </g>
    </svg>
  );
}
