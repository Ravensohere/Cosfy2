"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { BUDGET_TYPES, CATEGORIES } from "@/lib/constants";

const createBudgetSchema = z
  .object({
    type: z.enum(BUDGET_TYPES),
    category: z.enum(CATEGORIES).optional(),
    amount: z.number().positive("Enter an amount greater than 0"),
    alertThreshold: z.number().int().min(1).max(100).default(80),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .refine((data) => data.type !== "Category" || !!data.category, {
    message: "Pick a category",
    path: ["category"],
  });

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;

export async function createBudget(input: CreateBudgetInput) {
  const parsed = createBudgetSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await getCurrentUser();
  const { type, category, amount, alertThreshold, startDate, endDate } = parsed.data;

  await db.budget.create({
    data: {
      userId: user.id,
      type,
      category: type === "Category" ? category : null,
      amount,
      alertThreshold,
      startDate,
      endDate,
    },
  });

  revalidatePath("/budgets");
  redirect("/budgets");
}

export async function deleteBudget(id: string) {
  const user = await getCurrentUser();
  await db.budget.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/budgets");
}
