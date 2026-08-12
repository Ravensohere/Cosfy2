"use client";

import { useTransition } from "react";
import { Share2, Check, Trash2, RotateCcw } from "lucide-react";
import { toggleCouponRedeemed, deleteCoupon } from "@/lib/actions/coupons";
import { couponUrgency } from "@/lib/coupon-status";
import { inviteLine } from "@/lib/invite-link";
import { cn } from "@/lib/cn";
import { formatShortDate } from "@/lib/format";

const BAND_COLORS = ["#33588A", "#5E5790", "#3C7A3E", "#A66A1B"];

export function CouponCard({
  id,
  index,
  title,
  merchant,
  code,
  description,
  expiresAt,
  isRedeemed,
}: {
  id: string;
  index: number;
  title: string;
  merchant: string | null;
  code: string | null;
  description: string | null;
  expiresAt: Date | null;
  isRedeemed: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const urgency = couponUrgency(expiresAt, isRedeemed);
  const band = BAND_COLORS[index % BAND_COLORS.length];

  const badge = isRedeemed
    ? { text: "Used", className: "bg-white/90 text-cosfy-muted" }
    : urgency === "expired"
      ? { text: "Expired", className: "bg-white/90 text-cosfy-red" }
      : urgency === "soon" && expiresAt
        ? { text: formatShortDate(expiresAt), className: "bg-cosfy-amber text-white" }
        : null;

  const shareText =
    [`${title}${merchant ? ` at ${merchant}` : ""}`, code ? `Code: ${code}` : null].filter(Boolean).join("\n") + inviteLine();

  return (
    <div className={cn("rounded-card border border-cosfy-border overflow-hidden bg-cosfy-card", isRedeemed && "opacity-55")}>
      <div className="relative p-3 pb-4" style={{ backgroundColor: band }}>
        {badge ? (
          <span className={cn("absolute top-2 right-2 rounded-full px-2 py-0.5 text-[9px] font-bold", badge.className)}>
            {badge.text}
          </span>
        ) : null}
        <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wide truncate pr-10">
          {merchant || "Any store"}
        </p>
        <p className="text-[14px] font-extrabold text-white leading-snug line-clamp-2 mt-0.5 pr-2">{title}</p>
      </div>

      <div className="relative flex items-center px-3">
        <span className="w-3 h-3 rounded-full bg-cosfy-bg border border-cosfy-border -ml-3" />
        <span className="flex-1 border-t-2 border-dashed border-cosfy-border" />
        <span className="w-3 h-3 rounded-full bg-cosfy-bg border border-cosfy-border -mr-3" />
      </div>

      <div className="p-3">
        {code ? (
          <p className="font-mono text-[12px] font-bold text-cosfy-ink truncate">{code}</p>
        ) : (
          <p className="text-[12px] text-cosfy-muted">Auto-applied</p>
        )}
        {description ? <p className="text-[11px] text-cosfy-muted mt-1 line-clamp-2">{description}</p> : null}

        <div className="flex items-center gap-1 mt-2.5 -ml-1.5">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share coupon"
            className="p-1.5 text-cosfy-ink-soft"
          >
            <Share2 size={15} />
          </a>
          <button
            type="button"
            aria-label={isRedeemed ? "Mark as active" : "Mark as used"}
            onClick={() => startTransition(() => void toggleCouponRedeemed(id, !isRedeemed))}
            disabled={isPending}
            className="p-1.5 text-cosfy-ink-soft"
          >
            {isRedeemed ? <RotateCcw size={15} /> : <Check size={15} />}
          </button>
          <button
            type="button"
            aria-label="Delete coupon"
            onClick={() => startTransition(() => void deleteCoupon(id))}
            disabled={isPending}
            className="p-1.5 text-cosfy-muted ml-auto"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
