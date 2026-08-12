import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";
import { buttonClasses } from "@/components/ui/buttonClasses";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  fullWidth?: boolean;
  "data-tour"?: string;
};

export function PrimaryButton({ href, fullWidth, className, ...props }: Props) {
  const classes = buttonClasses("bg-cosfy-lime text-cosfy-lime-ink", fullWidth, className);
  if (href) {
    return (
      <Link href={href} className={classes} data-tour={props["data-tour"]}>
        {props.children}
      </Link>
    );
  }
  return <button className={classes} {...props} />;
}
