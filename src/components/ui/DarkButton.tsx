import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";
import { buttonClasses } from "@/components/ui/buttonClasses";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  fullWidth?: boolean;
};

export function DarkButton({ href, fullWidth, className, ...props }: Props) {
  const classes = buttonClasses("bg-cosfy-ink text-cosfy-lime", fullWidth, className);
  if (href) {
    return (
      <Link href={href} className={classes}>
        {props.children}
      </Link>
    );
  }
  return <button className={classes} {...props} />;
}
