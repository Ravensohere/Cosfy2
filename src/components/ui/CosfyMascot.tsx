export type MascotMood = "neutral" | "happy" | "concerned";

const MOUTHS: Record<MascotMood, string> = {
  happy: "M21 30q7 6 14 0",
  neutral: "M21 31h14",
  concerned: "M21 33q7 -6 14 0",
};

const BROWS: Record<MascotMood, string> = {
  happy: "",
  neutral: "",
  concerned: "M15 15l6 2M35 15l-6 2",
};

export function CosfyMascot({ mood = "neutral", size = 44 }: { mood?: MascotMood; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="22" cy="22" r="21" fill="var(--color-cosfy-lime)" />
      <circle cx="22" cy="22" r="21" fill="none" stroke="var(--color-cosfy-lime-deep)" strokeWidth="1" opacity="0.4" />
      <circle cx="15" cy="20" r="2.6" fill="var(--color-cosfy-lime-ink)" />
      <circle cx="29" cy="20" r="2.6" fill="var(--color-cosfy-lime-ink)" />
      {BROWS[mood] ? (
        <path d={BROWS[mood]} stroke="var(--color-cosfy-lime-ink)" strokeWidth="1.6" strokeLinecap="round" />
      ) : null}
      <path
        d={MOUTHS[mood]}
        stroke="var(--color-cosfy-lime-ink)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
