"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

const updateInputsSchema = z.object({
  bankBalance: z.number().min(0).optional(),
  otherInvestments: z.number().min(0).optional(),
  epfBalance: z.number().min(0).optional(),
});

export type UpdateNetWorthInputs = z.infer<typeof updateInputsSchema>;

export async function updateNetWorthInputs(input: UpdateNetWorthInputs) {
  const parsed = updateInputsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await getCurrentUser();
  await db.user.update({ where: { id: user.id }, data: parsed.data });
  revalidatePath("/net-worth");
  revalidatePath("/home");
  return { ok: true as const };
}

export async function getNetWorthBreakdown(userId: string) {
  const [user, goldHoldings, goals, creditCards, loans] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: userId } }),
    db.goldHolding.findMany({ where: { userId } }),
    db.goal.findMany({ where: { userId }, include: { contributions: true } }),
    db.creditCard.findMany({ where: { userId } }),
    db.loan.findMany({ where: { userId } }),
  ]);

  const bankBalance = user.bankBalance ?? 0;
  const otherInvestments = user.otherInvestments ?? 0;
  const epfBalance = user.epfBalance ?? 0;
  const goldValue = goldHoldings.reduce((sum, g) => sum + g.currentValue, 0);
  const goalSavings = goals.reduce((sum, g) => sum + g.contributions.reduce((s, c) => s + c.amount, 0), 0);
  const creditCardDues = creditCards.reduce((sum, c) => sum + c.currentDue, 0);
  const loanOutstanding = loans.reduce((sum, l) => sum + l.outstandingPrincipal, 0);

  const totalAssets = bankBalance + otherInvestments + epfBalance + goldValue + goalSavings;
  const totalLiabilities = creditCardDues + loanOutstanding;

  return {
    bankBalance,
    otherInvestments,
    epfBalance,
    goldValue,
    goalSavings,
    creditCardDues,
    loanOutstanding,
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
  };
}
