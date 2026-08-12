"use client";

import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { cn } from "@/lib/cn";

type Option = { value: string; label: string };

export function SelectField({
  value,
  onChange,
  options,
  placeholder = "Select",
  title = "Select",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: (Option | string)[];
  placeholder?: string;
  title?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const normalized: Option[] = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const selected = normalized.find((o) => o.value === value);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "w-full flex items-center justify-between gap-2 rounded-input border border-cosfy-border bg-cosfy-card h-[52px] px-4 text-[14px] text-left",
          className
        )}
      >
        <span className={cn("truncate", selected ? "text-cosfy-ink" : "text-cosfy-muted")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} className="text-cosfy-muted shrink-0" />
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title={title}>
        <div className="space-y-1.5">
          {normalized.map((o) => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between rounded-input border h-[52px] px-4 text-[14px] font-semibold transition-colors",
                  active
                    ? "bg-cosfy-lime text-cosfy-lime-ink border-cosfy-lime"
                    : "bg-cosfy-card text-cosfy-ink border-cosfy-border"
                )}
              >
                {o.label}
                {active ? <Check size={16} /> : null}
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </>
  );
}
