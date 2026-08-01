import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  fullWidth?: boolean;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-button bg-cosfy-card border border-cosfy-border-strong text-cosfy-ink font-bold text-[14px] h-[54px] px-6 transition-opacity active:opacity-80 disabled:opacity-40 disabled:pointer-events-none";

export function SecondaryButton({ href, fullWidth, className, ...props }: Props) {
  const classes = cn(base, fullWidth && "w-full", className);
  if (href) {
    return (
      <Link href={href} className={classes}>
        {props.children}
      </Link>
    );
  }
  return <button className={classes} {...props} />;
}
