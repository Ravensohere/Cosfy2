"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";

type ScannedCoupon = {
  title: string;
  merchant: string;
  code: string;
  description: string;
  expiresAt: string | null;
};

export function CouponPhotoScan({ onScanned }: { onScanned: (coupon: ScannedCoupon) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setPreview(URL.createObjectURL(file));
    setIsScanning(true);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/import/coupon-photo", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't read that coupon.");
        return;
      }
      onScanned(data as ScannedCoupon);
    } catch {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setIsScanning(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="flex items-center justify-center gap-2 rounded-card border-2 border-dashed border-cosfy-border h-14 cursor-pointer text-cosfy-ink-soft active:opacity-70 overflow-hidden">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Coupon preview" className="h-full max-w-[72px] object-cover rounded-input" />
        ) : (
          <Camera size={18} />
        )}
        <span className="text-[13px] font-semibold">
          {isScanning ? "Reading coupon…" : preview ? "Scan a different coupon" : "Scan coupon photo, or upload from gallery"}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={isScanning}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </label>
      {preview && !isScanning && !error ? (
        <p className="text-[11px] text-cosfy-muted mt-1.5">Scanned. Check the details below, fix anything that's off.</p>
      ) : null}
      {error ? <p className="text-[13px] text-cosfy-red mt-1.5">{error}</p> : null}
    </div>
  );
}
