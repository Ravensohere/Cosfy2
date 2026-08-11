"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { Image as ImageIcon, MessageCircle } from "lucide-react";
import { inviteLine } from "@/lib/invite-link";

export function SummaryShareCard({
  rangeLabel,
  shareText,
  children,
}: {
  rangeLabel: string;
  shareText: string;
  children: ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const fullShareText = shareText + inviteLine();

  async function handleShareImage() {
    if (!cardRef.current) return;
    setShareError(null);
    setIsCapturing(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, { backgroundColor: "#F6F3EC", scale: 2 });
      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Couldn't render image");

      const file = new File([blob], `cosfy-summary.png`, { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean };

      if (nav.canShare && nav.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `Cosfy summary, ${rangeLabel}` });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "cosfy-summary.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setShareError("Couldn't share the image. Try text instead.");
    } finally {
      setIsCapturing(false);
    }
  }

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
