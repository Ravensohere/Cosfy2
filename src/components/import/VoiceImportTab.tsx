"use client";

import { useRef, useState } from "react";
import { Mic } from "lucide-react";
import { TransactionReviewCard } from "@/components/import/TransactionReviewCard";
import type { CategoryValue, PaymentModeValue } from "@/lib/constants";

type Detected = {
  transcript: string;
  amount: number;
  description: string;
  category: CategoryValue;
  paymentMode: PaymentModeValue;
};

export function VoiceImportTab() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [detected, setDetected] = useState<Detected | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    setDetected(null);
    setSuccess(false);
    setIsUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/import/voice", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't understand that voice note.");
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
    if (inputRef.current) inputRef.current.value = "";
    setTimeout(() => setSuccess(false), 2500);
  }

  return (
    <div className="space-y-4">
      <label className="flex flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-cosfy-border h-40 cursor-pointer text-cosfy-muted">
        <Mic size={28} />
        <span className="text-[13px] font-semibold text-center px-6">
          Record or upload a voice note, e.g. &quot;spent 200 on groceries&quot;
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          capture="user"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </label>

      {isUploading ? <p className="text-[13px] text-cosfy-muted">Transcribing…</p> : null}
      {error ? <p className="text-[13px] text-cosfy-red">{error}</p> : null}

      {detected ? (
        <>
          <p className="text-[12px] text-cosfy-muted italic">&quot;{detected.transcript}&quot;</p>
          <TransactionReviewCard
            key={detected.transcript}
            amount={detected.amount}
            isCredit={detected.category === "Income"}
            initialDescription={detected.description}
            initialCategory={detected.category}
            initialPaymentMode={detected.paymentMode}
            onAdded={handleAdded}
          />
        </>
      ) : null}

      {success ? <p className="text-[13px] font-semibold text-cosfy-lime-ink">Added to Cosfy.</p> : null}
    </div>
  );
}
