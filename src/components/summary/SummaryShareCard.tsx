"use client";

import type { ReactNode } from "react";
import { Image as ImageIcon, MessageCircle } from "lucide-react";
import { inviteLine } from "@/lib/invite-link";
import { useImageShare } from "@/lib/useImageShare";

export function SummaryShareCard({
  rangeLabel,
  shareText,
  children,
}: {
  rangeLabel: string;
  shareText: string;
  children: ReactNode;
}) {
  const { cardRef, isCapturing, shareError, handleShareImage } = useImageShare({
    backgroundColor: "#F6F3EC",
    fileName: "cosfy-summary.png",
    shareTitle: `Cosfy summary, ${rangeLabel}`,
  });

  const fullShareText = shareText + inviteLine();

  return (
    <div>
      <div ref={cardRef} className="bg-cosfy-bg">
        {children}
      </div>

      <div className="flex gap-2 mt-4 mb-2">
        <button
          type="button"
          onClick={handleShareImage}
          disabled={isCapturing}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-button bg-cosfy-card border border-cosfy-border-strong text-cosfy-ink font-bold text-[13px] h-11 disabled:opacity-50"
        >
          <ImageIcon size={15} /> {isCapturing ? "Rendering…" : "Share image"}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(fullShareText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-button bg-cosfy-card border border-cosfy-border-strong text-cosfy-ink font-bold text-[13px] h-11"
        >
          <MessageCircle size={15} /> Share text
        </a>
      </div>
      {shareError ? <p className="text-[12px] text-cosfy-red">{shareError}</p> : null}
    </div>
  );
}
