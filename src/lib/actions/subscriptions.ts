"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { SUBSCRIPTION_CYCLES } from "@/lib/constants";

const createSubscriptionSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  amount: z.number().positive(),
  cycle: z.enum(SUBSCRIPTION_CYCLES),
  category: z.string().trim().max(40).optional(),
  nextRenewalDate: z.coerce.date(),
  source: z.enum(["manual", "detected"]).default("manual"),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;

const DAYS_PER_CYCLE: Record<(typeof SUBSCRIPTION_CYCLES)[number], number> = {
  Weekly: 7,
  Monthly: 30,
  Yearly: 365,
};

export async function createSubscription(input: CreateSubscriptionInput) {
  const parsed = createSubscriptionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await getCurrentUser();
  await db.subscription.create({ data: { userId: user.id, ...parsed.data } });
  revalidatePath("/subscriptions");
  return { ok: true as const };
}

export async function markSubscriptionRenewed(id: string) {
  const user = await getCurrentUser();
  const subscription = await db.subscription.findFirst({ where: { id, userId: user.id } });
  if (!subscription) return { ok: false as const, error: "Subscription not found" };

  const next = new Date(subscription.nextRenewalDate);
  next.setDate(next.getDate() + DAYS_PER_CYCLE[subscription.cycle as keyof typeof DAYS_PER_CYCLE]);

  await db.subscription.updateMany({ where: { id, userId: user.id }, data: { nextRenewalDate: next } });
  revalidatePath("/subscriptions");
  return { ok: true as const };
}

export async function deleteSubscription(id: string) {
  const user = await getCurrentUser();
  await db.subscription.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/subscriptions");
  return { ok: true as const };
}
