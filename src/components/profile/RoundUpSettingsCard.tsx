"use client";

import { useState, useTransition } from "react";
import { PiggyBank } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { PillChip } from "@/components/ui/PillChip";
import { SelectField } from "@/components/ui/SelectField";
import { updateRoundUpSettings } from "@/lib/actions/round-up";

const INCREMENTS = [10, 50, 100] as const;

export function RoundUpSettingsCard({
  roundUpEnabled,
  roundUpIncrement,
  roundUpGoalId,
  goals,
}: {
  roundUpEnabled: boolean;
  roundUpIncrement: number;
  roundUpGoalId: string | null;
  goals: { id: string; name: string }[];
}) {
  const [enabled, setEnabled] = useState(roundUpEnabled);
  const [increment, setIncrement] = useState<(typeof INCREMENTS)[number]>(
    INCREMENTS.includes(roundUpIncrement as (typeof INCREMENTS)[number]) ? (roundUpIncrement as (typeof INCREMENTS)[number]) : 10
  );
  const [goalId, setGoalId] = useState(roundUpGoalId ?? goals[0]?.id ?? "");
  const [, startTransition] = useTransition();

  function save(next: { enabled?: boolean; increment?: (typeof INCREMENTS)[number]; goalId?: string }) {
    const nextEnabled = next.enabled ?? enabled;
    const nextIncrement = next.increment ?? increment;
    const nextGoalId = next.goalId ?? goalId;
    startTransition(async () => {
      await updateRoundUpSettings({
        roundUpEnabled: nextEnabled,
        roundUpIncrement: nextIncrement,
        roundUpGoalId: nextGoalId || null,
      });
    });
  }

  return (
    <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4">
      <div className="flex items-center gap-3">
        <IconTile icon={PiggyBank} tone="lime" size={44} />
        <div className="flex-1">
          <p className="font-bold text-[14px] text-cosfy-ink">Round-up savings</p>
          <p className="text-[12px] text-cosfy-muted">Round expenses up, save the spare change to a goal</p>
        </div>
        <ToggleSwitch
          checked={enabled}
          onChange={(value) => {
            setEnabled(value);
            save({ enabled: value });
          }}
        />
      </div>

      {enabled ? (
        <div className="mt-3 space-y-3">
          <div className="flex gap-2">
            {INCREMENTS.map((inc) => (
              <PillChip
                key={inc}
                variant={inc === increment ? "active" : "inactive"}
                onClick={() => {
                  setIncrement(inc);
                  save({ increment: inc });
                }}
              >
                ₹{inc}
              </PillChip>
            ))}
          </div>
          {goals.length > 0 ? (
            <SelectField
              value={goalId}
              onChange={(v) => {
                setGoalId(v);
                save({ goalId: v });
              }}
              options={goals.map((g) => ({ value: g.id, label: g.name }))}
              title="Select goal"
            />
          ) : (
            <p className="text-[12px] text-cosfy-muted">Create a goal first to sweep round-ups into it.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
