import { daysUntil } from "@/lib/credit-card-status";

export type CouponUrgency = "expired" | "soon" | "upcoming" | "redeemed" | "none";

export function couponUrgency(expiresAt: Date | null, isRedeemed: boolean): CouponUrgency {
  if (isRedeemed) return "redeemed";
  if (!expiresAt) return "none";
  const days = daysUntil(expiresAt);
  if (days < 0) return "expired";
  if (days <= 5) return "soon";
  return "upcoming";
}
