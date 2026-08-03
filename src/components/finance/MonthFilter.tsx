"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

function label(m: string) {
  const [year, month] = m.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" }).format(new Date(year, month - 1, 1));
}

export function MonthFilter({ months, selected }: { months: string[]; selected: string | null }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 mb-4 -mx-1 px-1 scrollbar-none">
      <Link
        href="/transactions"
        className={cn(
          "shrink-0 rounded-full px-4 h-8 flex items-center text-[13px] font-semibold whitespace-nowrap",
          selected === null
            ? "bg-cosfy-lime text-cosfy-lime-ink border border-cosfy-lime"
            : "bg-cosfy-card-soft text-cosfy-ink border border-cosfy-border"
        )}
      >
        All
      </Link>
      {months.map((m) => (
        <Link
          key={m}
          href={`/transactions?m=${m}`}
          className={cn(
            "shrink-0 rounded-full px-4 h-8 flex items-center text-[13px] font-semibold whitespace-nowrap",
            selected === m
              ? "bg-cosfy-lime text-cosfy-lime-ink border border-cosfy-lime"
              : "bg-cosfy-card-soft text-cosfy-ink border border-cosfy-border"
          )}
        >
          {label(m)}
        </Link>
      ))}
    </div>
  );
}
