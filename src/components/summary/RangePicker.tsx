"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PillChip } from "@/components/ui/PillChip";
import { Input, FieldLabel } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { RANGE_PRESETS, type RangePreset } from "@/lib/summary-range";

export function RangePicker({
  preset,
  customStart,
  customEnd,
}: {
  preset: RangePreset;
  customStart?: string;
  customEnd?: string;
}) {
  const router = useRouter();
  const [showCustom, setShowCustom] = useState(preset === "custom");
  const [start, setStart] = useState(customStart ?? "");
  const [end, setEnd] = useState(customEnd ?? "");

  function selectPreset(value: RangePreset) {
    if (value === "custom") {
      setShowCustom(true);
      return;
    }
    setShowCustom(false);
    router.push(`/summary?range=${value}`);
  }

  function applyCustom() {
    if (!start || !end) return;
    router.push(`/summary?range=custom&start=${start}&end=${end}`);
  }

  return (
    <div className="mb-4">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {RANGE_PRESETS.map((p) => (
          <PillChip
            key={p.value}
            variant={preset === p.value ? "active" : "inactive"}
            onClick={() => selectPreset(p.value)}
          >
            {p.label}
          </PillChip>
        ))}
      </div>

      {showCustom ? (
        <div className="flex items-end gap-2 mt-3">
          <div className="flex-1">
            <FieldLabel>From</FieldLabel>
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className="flex-1">
            <FieldLabel>To</FieldLabel>
            <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <PrimaryButton className="h-[52px] px-4 text-[13px]" disabled={!start || !end} onClick={applyCustom}>
            Go
          </PrimaryButton>
        </div>
      ) : null}
    </div>
  );
}
