"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { INSURANCE_TYPES, INSURANCE_FREQUENCIES } from "@/lib/constants";

const createPolicySchema = z.object({
  type: z.enum(INSURANCE_TYPES),
  provider: z.string().trim().max(60).optional(),
  policyName: z.string().trim().min(1, "Policy name is required").max(80),
  premiumAmount: z.number().positive(),
  frequency: z.enum(INSURANCE_FREQUENCIES),
  nextRenewalDate: z.coerce.date(),
});

export type CreatePolicyInput = z.infer<typeof createPolicySchema>;

const MONTHS_PER_CYCLE: Record<(typeof INSURANCE_FREQUENCIES)[number], number> = {
  Monthly: 1,
  Quarterly: 3,
  HalfYearly: 6,
  Yearly: 12,
};

export async function createInsurancePolicy(input: CreatePolicyInput) {
  const parsed = createPolicySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await getCurrentUser();
  await db.insurancePolicy.create({ data: { userId: user.id, ...parsed.data } });
  revalidatePath("/insurance");
  return { ok: true as const };
}

export async function markPolicyRenewed(id: string) {
  const user = await getCurrentUser();
  const policy = await db.insurancePolicy.findFirst({ where: { id, userId: user.id } });
  if (!policy) return { ok: false as const, error: "Policy not found" };

  const next = new Date(policy.nextRenewalDate);
  next.setMonth(next.getMonth() + MONTHS_PER_CYCLE[policy.frequency as keyof typeof MONTHS_PER_CYCLE]);

  await db.insurancePolicy.updateMany({ where: { id, userId: user.id }, data: { nextRenewalDate: next } });
  revalidatePath("/insurance");
  return { ok: true as const };
}

export async function deleteInsurancePolicy(id: string) {
  const user = await getCurrentUser();
  await db.insurancePolicy.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/insurance");
  return { ok: true as const };
}
