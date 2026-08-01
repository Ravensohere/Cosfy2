"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { GOAL_TYPES } from "@/lib/constants";

const createGoalSchema = z.object({
  type: z.enum(GOAL_TYPES),
  name: z.string().trim().min(1, "Give your goal a name").max(60),
  targetAmount: z.number().positive("Enter an amount greater than 0"),
  targetDate: z.string().optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;

export async function createGoal(input: CreateGoalInput) {
  const parsed = createGoalSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await getCurrentUser();
  const { type, name, targetAmount, targetDate } = parsed.data;

  const goal = await db.goal.create({
    data: {
      userId: user.id,
      type,
      name,
      targetAmount,
      targetDate: targetDate ? new Date(targetDate) : null,
    },
  });

  revalidatePath("/goals");
  redirect(`/goals/${goal.id}`);
}

const contributionSchema = z.object({
  goalId: z.string().min(1),
  amount: z.number().positive("Enter an amount greater than 0"),
});

export async function addGoalContribution(input: z.infer<typeof contributionSchema>) {
  const parsed = contributionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await getCurrentUser();
  const goal = await db.goal.findFirst({ where: { id: parsed.data.goalId, userId: user.id } });
  if (!goal) {
    return { ok: false as const, error: "Goal not found" };
  }

  await db.goalContribution.create({
    data: { goalId: goal.id, amount: parsed.data.amount },
  });

  revalidatePath(`/goals/${goal.id}`);
  revalidatePath("/goals");
  return { ok: true as const };
}

export async function getAverageMonthlySurplus(userId: string): Promise<number | null> {
  const transactions = await db.transaction.findMany({ where: { userId } });
  if (transactions.length === 0) return null;

  const byMonth = new Map<string, number>();
  for (const t of transactions) {
    const key = `${t.date.getFullYear()}-${t.date.getMonth()}`;
    byMonth.set(key, (byMonth.get(key) ?? 0) + t.amount);
  }

  const months = Array.from(byMonth.values());
  const avg = months.reduce((sum, v) => sum + v, 0) / months.length;
  return avg;
}
