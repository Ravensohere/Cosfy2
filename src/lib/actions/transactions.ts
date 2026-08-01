"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { CATEGORIES, PAYMENT_MODES } from "@/lib/constants";

const createTransactionSchema = z.object({
  amount: z.number().refine((n) => n !== 0, "Amount can't be zero"),
  description: z.string().trim().min(1, "Description is required").max(120),
  category: z.enum(CATEGORIES),
  paymentMode: z.enum(PAYMENT_MODES),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

function revalidateMoneyScreens() {
  revalidatePath("/home");
  revalidatePath("/transactions");
  revalidatePath("/budgets");
}

export async function createTransaction(input: CreateTransactionInput) {
  const parsed = createTransactionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await getCurrentUser();
  const { amount, description, category, paymentMode } = parsed.data;
  const signedAmount = category === "Income" ? Math.abs(amount) : -Math.abs(amount);

  await db.transaction.create({
    data: {
      userId: user.id,
      amount: signedAmount,
      description,
      category,
      paymentMode,
      source: "manual",
    },
  });

  revalidateMoneyScreens();
  return { ok: true as const };
}

export async function deleteTransaction(id: string) {
  const user = await getCurrentUser();
  await db.transaction.deleteMany({ where: { id, userId: user.id } });
  revalidateMoneyScreens();
  return { ok: true as const };
}
