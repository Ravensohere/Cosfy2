"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

const createCouponSchema = z.object({
  title: z.string().trim().min(1, "Add a title").max(120),
  merchant: z.string().trim().max(60).optional(),
  code: z.string().trim().max(60).optional(),
  description: z.string().trim().max(300).optional(),
  expiresAt: z.string().optional(),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;

export async function createCoupon(input: CreateCouponInput) {
  const parsed = createCouponSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await getCurrentUser();
  const { title, merchant, code, description, expiresAt } = parsed.data;

  await db.coupon.create({
    data: {
      userId: user.id,
      title,
      merchant: merchant || null,
      code: code || null,
      description: description || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  revalidatePath("/coupons");
  revalidatePath("/calendar");
  return { ok: true as const };
}

export async function toggleCouponRedeemed(id: string, isRedeemed: boolean) {
  const user = await getCurrentUser();
  await db.coupon.updateMany({ where: { id, userId: user.id }, data: { isRedeemed } });
  revalidatePath("/coupons");
  return { ok: true as const };
}

export async function deleteCoupon(id: string) {
  const user = await getCurrentUser();
  await db.coupon.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/coupons");
  revalidatePath("/calendar");
  return { ok: true as const };
}
