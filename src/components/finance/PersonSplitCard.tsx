"use client";

import { useRef, useState } from "react";
import { User, Image as ImageIcon, MessageCircle } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { formatINR } from "@/lib/format";
import { inviteLine } from "@/lib/invite-link";
import type { PersonItemShare } from "@/lib/split-breakdown";

export function PersonSplitCard({
  merchant,
  personName,
  items,
  taxShare,
  total,
}: {
  merchant: string;
  personName: string;
  items: PersonItemShare[];
  taxShare: number;
  total: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const shareText =
    [
      `${personName}'s share, ${merchant}`,
      "",
      ...items.map((i) => `${i.name}${i.sharedWith.length > 0 ? ` (with ${i.sharedWith.join(", ")})` : ""}: ${formatINR(i.amount)}`),
      ...(Math.abs(taxShare) > 0.01 ? [`Tax & charges: ${formatINR(taxShare)}`] : []),
      "",
      `Total: ${formatINR(total)}`,
    ].join("\n") + inviteLine();

  async function handleShareImage() {
    if (!cardRef.current) return;
    setShareError(null);
    setIsCapturing(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, { backgroundColor: "#FFFFFF", scale: 2 });
      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Couldn't render image");

      const file = new File([blob], `${personName}-split.png`, { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean };

      if (nav.canShare && nav.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `${personName}'s split` });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${personName}-split.png`;
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
    <div className="rounded-card bg-cosfy-card border border-cosfy-border overflow-hidden">
      <div ref={cardRef} className="bg-white p-4">
        <div className="flex items-center gap-3 mb-3">
          <IconTile icon={User} tone="soft" size={40} className="border border-cosfy-border" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[15px] text-cosfy-ink truncate">{personName}</p>
            <p className="text-[11px] text-cosfy-muted truncate">{merchant}</p>
          </div>
          <MoneyAmount amount={total} size="md" />
        </div>

        {items.length > 0 ? (
          <div className="space-y-1.5 mb-1">
            {items.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-[12px]">
                <span className="text-cosfy-ink-soft truncate">
                  {item.name}
                  {item.sharedWith.length > 0 ? (
                    <span className="text-cosfy-muted"> (with {item.sharedWith.join(", ")})</span>
                  ) : null}
                </span>
                <span className="text-cosfy-ink font-semibold shrink-0">{formatINR(item.amount)}</span>
              </div>
            ))}
            {Math.abs(taxShare) > 0.01 ? (
              <div className="flex items-center justify-between gap-2 text-[12px] pt-1 border-t border-cosfy-border">
                <span className="text-cosfy-muted">Tax & charges</span>
                <span className="text-cosfy-ink font-semibold">{formatINR(taxShare)}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        <p className="text-[10px] text-cosfy-muted text-right mt-2">Split with Cosfy</p>
      </div>

      <div className="flex gap-2 p-3 pt-2">
        <button
          type="button"
          onClick={handleShareImage}
          disabled={isCapturing}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-button bg-cosfy-card-soft border border-cosfy-border text-cosfy-ink font-bold text-[12px] h-10 disabled:opacity-50"
        >
          <ImageIcon size={14} /> {isCapturing ? "Rendering…" : "Share image"}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-button bg-cosfy-card-soft border border-cosfy-border text-cosfy-ink font-bold text-[12px] h-10"
        >
          <MessageCircle size={14} /> Share text
        </a>
      </div>
      {shareError ? <p className="text-[11px] text-cosfy-red px-3 pb-2">{shareError}</p> : null}
    </div>
  );
}
