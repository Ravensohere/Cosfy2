import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";
import { buttonClasses } from "@/components/ui/buttonClasses";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  fullWidth?: boolean;
};

export function SecondaryButton({ href, fullWidth, className, ...props }: Props) {
  const classes = buttonClasses("bg-cosfy-card border border-cosfy-border-strong text-cosfy-ink", fullWidth, className);
  if (href) {
    return (
      <Link href={href} className={classes}>
        {props.children}
      </Link>
    );
  }
  return <button className={classes} {...props} />;
}
