"use client";

import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { TransactionReviewCard } from "@/components/import/TransactionReviewCard";
import type { CategoryValue, PaymentModeValue } from "@/lib/constants";

type Detected = {
  amount: number;
  description: string;
  category: CategoryValue;
  paymentMode: PaymentModeValue;
  isCredit: boolean;
};

export function ScreenshotImportTab() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [detected, setDetected] = useState<Detected | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    setDetected(null);
    setSuccess(false);
    setPreview(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/import/screenshot", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't read that screenshot.");
        return;
      }
      setDetected(data);
    } catch {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleAdded() {
    setSuccess(true);
    setDetected(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
    setTimeout(() => setSuccess(false), 2500);
  }

  return (
    <div className="space-y-4">
      <label className="flex flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-cosfy-border h-40 cursor-pointer text-cosfy-muted">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Selected screenshot" className="h-full w-full object-contain rounded-card" />
        ) : (
          <>
            <ImagePlus size={28} />
            <span className="text-[13px] font-semibold">Upload a payment screenshot</span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </label>

      {isUploading ? <p className="text-[13px] text-cosfy-muted">Reading screenshot…</p> : null}
      {error ? <p className="text-[13px] text-cosfy-red">{error}</p> : null}

      {detected ? (
        <TransactionReviewCard
          key={preview}
          amount={detected.amount}
          isCredit={detected.isCredit}
          initialDescription={detected.description}
          initialCategory={detected.category}
          initialPaymentMode={detected.paymentMode}
          onAdded={handleAdded}
        />
      ) : null}

      {success ? <p className="text-[13px] font-semibold text-cosfy-lime-ink">Added to Cosfy.</p> : null}
    </div>
  );
}
