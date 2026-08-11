"use client";

import { useTransition } from "react";
import { Trash2, Tag } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import { ShareCouponButton } from "@/components/coupons/ShareCouponButton";
import { toggleCouponRedeemed, deleteCoupon } from "@/lib/actions/coupons";
import { couponUrgency } from "@/lib/coupon-status";
import { cn } from "@/lib/cn";

const URGENCY_STYLES: Record<string, string> = {
  expired: "text-cosfy-red",
  soon: "text-cosfy-amber",
  upcoming: "text-cosfy-muted",
  redeemed: "text-cosfy-muted",
  none: "text-cosfy-muted",
};

export function CouponCard({
  id,
  title,
  merchant,
  code,
  description,
  expiresAt,
  isRedeemed,
}: {
  id: string;
  title: string;
  merchant: string | null;
  code: string | null;
  description: string | null;
  expiresAt: Date | null;
  isRedeemed: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const urgency = couponUrgency(expiresAt, isRedeemed);

  const expiryLabel = isRedeemed
    ? "Used"
    : urgency === "expired"
      ? "Expired"
      : expiresAt
        ? `Expires ${expiresAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
        : "No expiry";

  return (
    <div className={cn("rounded-card bg-cosfy-card border border-cosfy-border p-4", isRedeemed && "opacity-60")}>
      <div className="flex items-start gap-3 mb-3">
        <IconTile icon={Tag} tone={urgency === "soon" ? "lime" : "soft"} size={40} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[14px] text-cosfy-ink truncate">{title}</p>
          <p className="text-[12px] text-cosfy-muted truncate">{merchant || "Any store"}</p>
        </div>
        <button
          type="button"
          aria-label="Delete coupon"
          onClick={() => startTransition(() => void deleteCoupon(id))}
          disabled={isPending}
          className="text-cosfy-muted p-1"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {code ? (
        <p className="font-mono text-[13px] font-bold text-cosfy-lime-ink bg-cosfy-lime-pale border border-cosfy-lime-soft rounded-input px-3 py-1.5 inline-block mb-2">
          {code}
        </p>
      ) : null}

      {description ? <p className="text-[12px] text-cosfy-muted mb-2">{description}</p> : null}

      <p className={cn("text-[11px] font-semibold mb-3", URGENCY_STYLES[urgency])}>{expiryLabel}</p>

      <div className="flex items-center gap-2">
        <ShareCouponButton title={title} merchant={merchant} code={code} expiresAt={expiresAt} />
      </div>
      <button
        type="button"
        onClick={() => startTransition(() => void toggleCouponRedeemed(id, !isRedeemed))}
        disabled={isPending}
        className="text-[12px] font-semibold text-cosfy-lime-deep mt-2"
      >
        {isRedeemed ? "Mark as active" : "Mark as used"}
      </button>
    </div>
  );
}
