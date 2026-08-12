"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

const createLoanSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  lender: z.string().trim().max(40).optional(),
  principal: z.number().positive(),
  interestRate: z.number().min(0).max(50),
  tenureMonths: z.number().int().min(1).max(600),
  emiAmount: z.number().positive(),
  startDate: z.coerce.date(),
  dueDay: z.number().int().min(1).max(31),
  outstandingPrincipal: z.number().min(0),
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;

export async function createLoan(input: CreateLoanInput) {
  const parsed = createLoanSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await getCurrentUser();
  await db.loan.create({ data: { userId: user.id, ...parsed.data } });
  revalidatePath("/loans");
  return { ok: true as const };
}

export async function recordEmiPayment(id: string) {
  const user = await getCurrentUser();
  const loan = await db.loan.findFirst({ where: { id, userId: user.id } });
  if (!loan) return { ok: false as const, error: "Loan not found" };

  const outstandingPrincipal = Math.max(0, loan.outstandingPrincipal - loan.emiAmount);
  await db.loan.updateMany({ where: { id, userId: user.id }, data: { outstandingPrincipal } });
  revalidatePath("/loans");
  return { ok: true as const };
}

export async function deleteLoan(id: string) {
  const user = await getCurrentUser();
  await db.loan.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/loans");
  return { ok: true as const };
}
