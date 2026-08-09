"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { GOLD_TYPES } from "@/lib/constants";

const createHoldingSchema = z.object({
  type: z.enum(GOLD_TYPES),
  grams: z.number().positive(),
  purchasePrice: z.number().positive(),
  purchaseDate: z.coerce.date(),
  currentValue: z.number().min(0),
});

export type CreateGoldHoldingInput = z.infer<typeof createHoldingSchema>;

export async function createGoldHolding(input: CreateGoldHoldingInput) {
  const parsed = createHoldingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await getCurrentUser();
  await db.goldHolding.create({ data: { userId: user.id, ...parsed.data } });
  revalidatePath("/gold");
  revalidatePath("/net-worth");
  return { ok: true as const };
}

export async function updateGoldCurrentValue(id: string, currentValue: number) {
  const user = await getCurrentUser();
  await db.goldHolding.updateMany({ where: { id, userId: user.id }, data: { currentValue: Math.max(0, currentValue) } });
  revalidatePath("/gold");
  revalidatePath("/net-worth");
  return { ok: true as const };
}

export async function deleteGoldHolding(id: string) {
  const user = await getCurrentUser();
  await db.goldHolding.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/gold");
  revalidatePath("/net-worth");
  return { ok: true as const };
}
