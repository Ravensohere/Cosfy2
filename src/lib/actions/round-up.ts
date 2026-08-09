"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { roundUpFor } from "@/lib/round-up";

const settingsSchema = z.object({
  roundUpEnabled: z.boolean(),
  roundUpIncrement: z.union([z.literal(10), z.literal(50), z.literal(100)]),
  roundUpGoalId: z.string().nullable(),
});

export type RoundUpSettingsInput = z.infer<typeof settingsSchema>;

export async function updateRoundUpSettings(input: RoundUpSettingsInput) {
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await getCurrentUser();
  await db.user.update({ where: { id: user.id }, data: parsed.data });
  revalidatePath("/profile");
  revalidatePath("/goals");
  return { ok: true as const };
}

export async function getUnclaimedRoundUpTotal(userId: string, increment: number) {
  const transactions = await db.transaction.findMany({
    where: { userId, amount: { lt: 0 }, roundUpClaimed: false },
    select: { id: true, amount: true },
  });

  let total = 0;
  const ids: string[] = [];
  for (const t of transactions) {
    const roundUp = roundUpFor(Math.abs(t.amount), increment);
    if (roundUp > 0) {
      total += roundUp;
      ids.push(t.id);
    }
  }

  return { total: Math.round(total * 100) / 100, transactionIds: ids };
}

export async function sweepRoundUps(goalId: string) {
  const user = await getCurrentUser();
  const goal = await db.goal.findFirst({ where: { id: goalId, userId: user.id } });
  if (!goal) return { ok: false as const, error: "Goal not found" };

  const { total, transactionIds } = await getUnclaimedRoundUpTotal(user.id, user.roundUpIncrement);
  if (total <= 0) return { ok: false as const, error: "No round-ups to sweep yet" };

  await db.$transaction([
    db.goalContribution.create({ data: { goalId, amount: total } }),
    db.transaction.updateMany({ where: { id: { in: transactionIds } }, data: { roundUpClaimed: true } }),
  ]);

  revalidatePath("/goals");
  revalidatePath(`/goals/${goalId}`);
  return { ok: true as const, amountSwept: total };
}
