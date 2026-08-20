"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { guessCategory, guessPaymentMode } from "@/lib/quick-add-parser";
import { revalidatePath } from "next/cache";

const billItemSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1),
  quantity: z.number().positive(),
  price: z.number().nonnegative(),
});

const saveBillOnlySchema = z.object({
  merchant: z.string().trim().min(1, "Add a merchant name"),
  items: z.array(billItemSchema).min(1, "Add at least one item"),
  taxAndCharges: z.number(),
});

export async function saveBillAsPersonalExpense(input: z.infer<typeof saveBillOnlySchema>) {
  const parsed = saveBillOnlySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await getCurrentUser();
  const { merchant, items, taxAndCharges } = parsed.data;
  const total = items.reduce((sum, i) => sum + i.quantity * i.price, 0) + taxAndCharges;

  await db.transaction.create({
    data: {
      userId: user.id,
      amount: -Math.abs(total),
      description: merchant,
      category: guessCategory(merchant),
      paymentMode: guessPaymentMode(merchant),
      source: "manual",
    },
  });

  revalidatePath("/home");
  revalidatePath("/transactions");
  redirect("/home");
}

const confirmSplitSchema = z.object({
  merchant: z.string().trim().min(1),
  items: z.array(billItemSchema).min(1),
  taxAndCharges: z.number(),
  groupId: z.string().nullable(),
  participants: z.array(z.object({ id: z.string(), name: z.string().trim().min(1), memberId: z.string().optional() })).min(2),
  assignments: z.record(z.string(), z.array(z.string())),
});

/**
 * Splits item costs across participants (proportional to what each person ordered),
 * then folds tax/charges in proportionally to each person's raw item share. The last
 * participant absorbs any rounding remainder so shares always sum exactly to `total`.
 */
function computeShares(
  items: z.infer<typeof billItemSchema>[],
  taxAndCharges: number,
  participantIds: string[],
  assignments: Record<string, string[]>
): { total: number; shares: Record<string, number> } {
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
  const total = subtotal + taxAndCharges;

  const rawShare: Record<string, number> = Object.fromEntries(participantIds.map((id) => [id, 0]));
  for (const item of items) {
    const assignees = assignments[item.id];
    const itemTotal = item.quantity * item.price;
    const per = itemTotal / assignees.length;
    for (const pid of assignees) {
      rawShare[pid] = (rawShare[pid] ?? 0) + per;
    }
  }

  const taxRatio = subtotal > 0 ? taxAndCharges / subtotal : 0;
  const shares: Record<string, number> = {};
  let allocated = 0;
  participantIds.forEach((pid, idx) => {
    if (idx === participantIds.length - 1) {
      shares[pid] = Math.round((total - allocated) * 100) / 100;
    } else {
      const share = Math.round((rawShare[pid] + rawShare[pid] * taxRatio) * 100) / 100;
      shares[pid] = share;
      allocated += share;
    }
  });

  return { total, shares };
}

export async function confirmBillSplit(input: z.infer<typeof confirmSplitSchema>) {
  const parsed = confirmSplitSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await getCurrentUser();
  const { merchant, items, taxAndCharges, groupId, participants, assignments } = parsed.data;

  for (const item of items) {
    if (!assignments[item.id] || assignments[item.id].length === 0) {
      return { ok: false as const, error: `Assign "${item.name}" to at least one person` };
    }
  }

  const { total, shares: finalShare } = computeShares(
    items,
    taxAndCharges,
    participants.map((p) => p.id),
    assignments
  );

  try {
    const result = await db.$transaction(async (tx) => {
      let resolvedGroupId = groupId;
      let payerMemberId: string;
      const wizardIdToMemberId = new Map<string, string>();

      if (groupId) {
        const group = await tx.group.findFirst({ where: { id: groupId, userId: user.id }, include: { members: true } });
        if (!group) throw new Error("Group not found");
        const you = group.members.find((m) => m.isCurrentUser);
        if (!you) throw new Error("Could not identify you in this group");
        payerMemberId = you.id;
        const groupMemberIds = new Set(group.members.map((m) => m.id));
        for (const p of participants) {
          if (p.memberId) {
            if (!groupMemberIds.has(p.memberId)) throw new Error("Invalid participant");
            wizardIdToMemberId.set(p.id, p.memberId);
          }
        }
      } else {
        const newGroup = await tx.group.create({
          data: {
            userId: user.id,
            name: merchant || "Split bill",
            type: "Friends",
            defaultSplit: "ByItem",
            isOneTime: true,
          },
        });
        resolvedGroupId = newGroup.id;
        for (const p of participants) {
          const member = await tx.groupMember.create({
            data: { groupId: newGroup.id, name: p.name, isCurrentUser: p.id === "you" },
          });
          wizardIdToMemberId.set(p.id, member.id);
        }
        payerMemberId = wizardIdToMemberId.get("you")!;
      }

      const itemsBreakdown = {
        items: items.map((i) => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price })),
        assignments: Object.fromEntries(
          Object.entries(assignments).map(([itemId, wizardIds]) => [
            itemId,
            wizardIds.map((wid) => wizardIdToMemberId.get(wid)).filter((mid): mid is string => Boolean(mid)),
          ])
        ),
        taxAndCharges,
      };

      const expense = await tx.groupExpense.create({
        data: {
          groupId: resolvedGroupId!,
          description: merchant || "Scanned bill",
          totalAmount: total,
          paidByMemberId: payerMemberId,
          splitType: "ByItem",
          itemsBreakdown,
          splits: {
            create: participants
              .map((p) => ({ memberId: wizardIdToMemberId.get(p.id)!, shareAmount: finalShare[p.id] ?? 0 }))
              .filter((s) => s.shareAmount > 0),
          },
        },
      });

      return { groupId: resolvedGroupId!, expenseId: expense.id };
    });

    revalidatePath(`/groups/${result.groupId}`);
    revalidatePath("/groups");
    return { ok: true as const, groupExpenseId: result.expenseId };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Couldn't create split" };
  }
}
