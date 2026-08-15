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

export async function updateTransaction(id: string, input: CreateTransactionInput) {
  const parsed = createTransactionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await getCurrentUser();
  const { amount, description, category, paymentMode } = parsed.data;
  const signedAmount = category === "Income" ? Math.abs(amount) : -Math.abs(amount);

  const result = await db.transaction.updateMany({
    where: { id, userId: user.id },
    data: { amount: signedAmount, description, category, paymentMode },
  });
  if (result.count === 0) return { ok: false as const, error: "Transaction not found" };

  revalidateMoneyScreens();
  return { ok: true as const };
}

export async function deleteTransaction(id: string) {
  const user = await getCurrentUser();
  const result = await db.transaction.deleteMany({ where: { id, userId: user.id } });
  if (result.count === 0) return { ok: false as const, error: "Transaction not found" };

  revalidateMoneyScreens();
  return { ok: true as const };
}

const bulkRowSchema = z.object({
  amount: z.number().refine((n) => n !== 0, "Amount can't be zero"),
  description: z.string().trim().min(1).max(120),
  category: z.enum(CATEGORIES),
  paymentMode: z.enum(PAYMENT_MODES),
});

export async function createTransactionsBulk(rows: z.infer<typeof bulkRowSchema>[]) {
  const parsedRows = rows.map((r) => bulkRowSchema.safeParse(r)).filter((r) => r.success);
  if (parsedRows.length === 0) {
    return { ok: false as const, error: "No valid rows to import" };
  }

  const user = await getCurrentUser();
  await db.transaction.createMany({
    data: parsedRows.map((r) => ({
      userId: user.id,
      amount: r.data!.amount,
      description: r.data!.description,
      category: r.data!.category,
      paymentMode: r.data!.paymentMode,
      source: "import",
    })),
  });

  revalidateMoneyScreens();
  return { ok: true as const, count: parsedRows.length };
}
