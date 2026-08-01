import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

export function PageContainer({
  title,
  backHref,
  action,
  children,
  navSpace = true,
}: {
  title?: string;
  backHref?: string;
  action?: ReactNode;
  children: ReactNode;
  navSpace?: boolean;
}) {
  return (
    <div className={`px-5 pt-6 md:px-10 md:pt-10 md:max-w-2xl md:mx-auto ${navSpace ? "pb-28 md:pb-16" : "pb-8"}`}>
      {(title || backHref) && (
        <div className="flex items-center justify-between mb-5 md:mb-7 min-h-[36px]">
          <div className="flex items-center gap-3">
            {backHref ? (
              <Link
                href={backHref}
                aria-label="Back"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-cosfy-card border border-cosfy-border"
              >
                <ChevronLeft size={18} />
              </Link>
            ) : null}
            {title ? <h1 className="text-[22px] md:text-[26px] font-extrabold text-cosfy-ink">{title}</h1> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
