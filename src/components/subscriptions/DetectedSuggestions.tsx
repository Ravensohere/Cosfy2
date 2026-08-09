"use client";

import { useState, useTransition } from "react";
import { Sparkles, Check, X } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import type { RecurringSuggestion } from "@/lib/recurring-detector";
import { createSubscription } from "@/lib/actions/subscriptions";

export function DetectedSuggestions({ suggestions }: { suggestions: RecurringSuggestion[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const visible = suggestions.filter((s) => !dismissed.has(s.description));

  if (visible.length === 0) return null;

  return (
    <div>
      <h2 className="text-[15px] font-extrabold text-cosfy-ink mb-2">Looks recurring</h2>
      <div className="space-y-3">
        {visible.map((suggestion) => (
          <SuggestionRow
            key={suggestion.description}
            suggestion={suggestion}
            onDismiss={() => setDismissed((prev) => new Set(prev).add(suggestion.description))}
          />
        ))}
      </div>
    </div>
  );
}

function SuggestionRow({
  suggestion,
  onDismiss,
}: {
  suggestion: RecurringSuggestion;
  onDismiss: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  function accept() {
    startTransition(async () => {
      await createSubscription({
        name: suggestion.description,
        amount: suggestion.amount,
        cycle: "Monthly",
        category: suggestion.category,
        nextRenewalDate: suggestion.nextRenewalDate,
        source: "detected",
      });
    });
  }

  return (
    <div className="rounded-card bg-cosfy-card-soft border border-dashed border-cosfy-border p-4">
      <div className="flex items-center gap-3">
        <IconTile icon={Sparkles} tone="soft" size={44} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[14px] text-cosfy-ink truncate">{suggestion.description}</p>
          <p className="text-[12px] text-cosfy-muted font-semibold">
            Seen {suggestion.occurrences}× monthly-ish · {suggestion.category}
          </p>
        </div>
        <MoneyAmount amount={suggestion.amount} size="md" />
      </div>
      <div className="flex gap-2 mt-3">
        <SecondaryButton className="flex-1 h-9 text-[12px]" onClick={accept} disabled={isPending}>
          <Check size={14} /> Track it
        </SecondaryButton>
        <SecondaryButton className="h-9 text-[12px] px-3" onClick={onDismiss} disabled={isPending}>
          <X size={14} />
        </SecondaryButton>
      </div>
    </div>
  );
}
