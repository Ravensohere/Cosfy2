"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

const createCardSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  bank: z.string().trim().max(40).optional(),
  last4: z
    .string()
    .trim()
    .regex(/^\d{0,4}$/, "Last 4 digits only")
    .optional(),
  statementDay: z.number().int().min(1).max(31),
  dueDay: z.number().int().min(1).max(31),
  currentDue: z.number().min(0),
  rewardPointsBalance: z.number().int().min(0).optional(),
  cashbackYtd: z.number().min(0).optional(),
});

export type CreateCreditCardInput = z.infer<typeof createCardSchema>;

export async function createCreditCard(input: CreateCreditCardInput) {
  const parsed = createCardSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await getCurrentUser();
  await db.creditCard.create({ data: { userId: user.id, ...parsed.data } });
  revalidatePath("/credit-cards");
  return { ok: true as const };
}

export async function updateCreditCardDue(id: string, currentDue: number) {
  const user = await getCurrentUser();
  await db.creditCard.updateMany({ where: { id, userId: user.id }, data: { currentDue } });
  revalidatePath("/credit-cards");
  return { ok: true as const };
}

export async function updateCreditCardRewards(id: string, rewardPointsBalance: number, cashbackYtd: number) {
  const user = await getCurrentUser();
  await db.creditCard.updateMany({
    where: { id, userId: user.id },
    data: { rewardPointsBalance, cashbackYtd },
  });
  revalidatePath("/credit-cards");
  return { ok: true as const };
}

export async function deleteCreditCard(id: string) {
  const user = await getCurrentUser();
  await db.creditCard.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/credit-cards");
  return { ok: true as const };
}
