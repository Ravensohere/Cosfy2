"use client";

import { Image as ImageIcon, MessageCircle } from "lucide-react";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { formatINR } from "@/lib/format";
import { inviteLine } from "@/lib/invite-link";
import { useImageShare } from "@/lib/useImageShare";
import type { ItemsBreakdown } from "@/lib/split-breakdown";

export function FullSplitShareCard({
  merchant,
  paidByName,
  total,
  breakdown,
  memberNamesById,
  people,
}: {
  merchant: string;
  paidByName: string;
  total: number;
  breakdown: ItemsBreakdown | null;
  memberNamesById: Record<string, string>;
  people: { name: string; amount: number }[];
}) {
  const { cardRef, isCapturing, shareError, handleShareImage } = useImageShare({
    backgroundColor: "#FFFFFF",
    fileName: "cosfy-split.png",
    shareTitle: `${merchant} split`,
  });

  const shareText =
    [
      `${merchant}: ${formatINR(total)}`,
      `Paid by ${paidByName}`,
      "",
      ...(breakdown && breakdown.items.length > 0
        ? [
            "Items:",
            ...breakdown.items.map((item) => {
              const assignees = (breakdown.assignments[item.id] ?? []).map((id) => memberNamesById[id]).filter(Boolean);
              return `${item.name} (${assignees.join(", ") || "unassigned"}): ${formatINR(item.quantity * item.price)}`;
            }),
            "",
          ]
        : []),
      "Who owes what:",
      ...people.map((p) => `${p.name}: ${formatINR(p.amount)}`),
    ].join("\n") + inviteLine();

  return (
    <div className="rounded-card bg-cosfy-card border border-cosfy-border overflow-hidden mb-5">
      <div ref={cardRef} className="bg-white p-4">
        <p className="text-[15px] font-extrabold text-cosfy-ink">{merchant}</p>
        <p className="text-[12px] text-cosfy-muted mb-3">Paid by {paidByName}</p>

        {breakdown && breakdown.items.length > 0 ? (
          <div className="space-y-1.5 mb-3 pb-3 border-b border-cosfy-border">
            {breakdown.items.map((item) => {
              const assignees = (breakdown.assignments[item.id] ?? []).map((id) => memberNamesById[id]).filter(Boolean);
              return (
                <div key={item.id} className="flex items-center justify-between gap-2 text-[12px]">
                  <span className="text-cosfy-ink-soft truncate">
                    {item.name}
                    {assignees.length > 0 ? <span className="text-cosfy-muted"> ({assignees.join(", ")})</span> : null}
                  </span>
                  <span className="text-cosfy-ink font-semibold shrink-0">{formatINR(item.quantity * item.price)}</span>
                </div>
              );
            })}
          </div>
        ) : null}

        <div className="space-y-1.5 mb-2">
          {people.map((p, i) => (
            <div key={i} className="flex items-center justify-between text-[13px]">
              <span className="text-cosfy-ink font-semibold">{p.name}</span>
              <MoneyAmount amount={p.amount} size="sm" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-[13px] font-bold pt-2 border-t border-cosfy-border">
          <span>Total</span>
          <MoneyAmount amount={total} size="sm" />
        </div>

        <p className="text-[10px] text-cosfy-muted text-right mt-3">Split with Cosfy</p>
      </div>

      <div className="flex gap-2 p-3 pt-3">
        <button
          type="button"
          onClick={handleShareImage}
          disabled={isCapturing}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-button bg-cosfy-card-soft border border-cosfy-border text-cosfy-ink font-bold text-[13px] h-11 disabled:opacity-50"
        >
          <ImageIcon size={15} /> {isCapturing ? "Rendering…" : "Share image"}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-button bg-cosfy-card-soft border border-cosfy-border text-cosfy-ink font-bold text-[13px] h-11"
        >
          <MessageCircle size={15} /> Share text
        </a>
      </div>
      {shareError ? <p className="text-[12px] text-cosfy-red px-3 pb-3">{shareError}</p> : null}
    </div>
  );
}
