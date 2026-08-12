"use client";

import { useRef, useState } from "react";

/**
 * Captures a card ref as a PNG (via html2canvas) and shares it through the
 * Web Share API when available, falling back to a browser download.
 * Shared by every "share as image" card (split cards, summary card) — each
 * only differs in capture background, file name, and share title.
 */
export function useImageShare({
  backgroundColor,
  fileName,
  shareTitle,
}: {
  backgroundColor: string;
  fileName: string;
  shareTitle: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  async function handleShareImage() {
    if (!cardRef.current) return;
    setShareError(null);
    setIsCapturing(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, { backgroundColor, scale: 2 });
      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Couldn't render image");

      const file = new File([blob], fileName, { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean };

      if (nav.canShare && nav.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: shareTitle });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      // User-cancelled native share sheet — not an error worth surfacing.
      if (err instanceof Error && err.name === "AbortError") return;
      setShareError("Couldn't share the image. Try text instead.");
    } finally {
      setIsCapturing(false);
    }
  }

  return { cardRef, isCapturing, shareError, handleShareImage };
}
