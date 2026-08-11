"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input, FieldLabel, Textarea } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { CouponPhotoScan } from "@/components/coupons/CouponPhotoScan";
import { createCoupon } from "@/lib/actions/coupons";

export function CreateCouponForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [merchant, setMerchant] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleScanned(scanned: { title: string; merchant: string; code: string; description: string; expiresAt: string | null }) {
    setError(null);
    if (scanned.title) setTitle(scanned.title);
    if (scanned.merchant) setMerchant(scanned.merchant);
    if (scanned.code) setCode(scanned.code);
    if (scanned.description) setDescription(scanned.description);
    if (scanned.expiresAt) setExpiresAt(scanned.expiresAt);
  }

  function handleSave() {
    if (!title.trim()) {
      setError("Add a title");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createCoupon({ title: title.trim(), merchant, code, description, expiresAt });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/coupons");
    });
  }

  return (
    <div className="space-y-5">
      <CouponPhotoScan onScanned={handleScanned} />

      <div>
        <FieldLabel>Title</FieldLabel>
        <Input placeholder="e.g. 20% off first order" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <FieldLabel>Merchant</FieldLabel>
        <Input placeholder="e.g. Swiggy" value={merchant} onChange={(e) => setMerchant(e.target.value)} />
      </div>
      <div>
        <FieldLabel>Coupon code</FieldLabel>
        <Input placeholder="e.g. WELCOME20" value={code} onChange={(e) => setCode(e.target.value)} />
      </div>
      <div>
        <FieldLabel>Details (optional)</FieldLabel>
        <Textarea placeholder="Min order value, category, any terms" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <FieldLabel>Expires on (optional)</FieldLabel>
        <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
      </div>

      {error ? <p className="text-[13px] text-cosfy-red">{error}</p> : null}

      <PrimaryButton fullWidth disabled={isPending} onClick={handleSave}>
        {isPending ? "Saving…" : "Save coupon"}
      </PrimaryButton>
    </div>
  );
}
