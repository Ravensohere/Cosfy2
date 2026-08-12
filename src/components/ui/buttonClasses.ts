import { cn } from "@/lib/cn";

/** Shared base classes for PrimaryButton/SecondaryButton/DarkButton — only the color/border classes differ per variant. */
export function buttonClasses(colorClasses: string, fullWidth: boolean | undefined, className: string | undefined) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-button font-bold text-[14px] h-[54px] px-6 transition-opacity active:opacity-80 disabled:opacity-40 disabled:pointer-events-none",
    colorClasses,
    fullWidth && "w-full",
    className
  );
}
