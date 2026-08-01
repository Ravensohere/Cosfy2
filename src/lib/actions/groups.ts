"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { GROUP_TYPES, SPLIT_TYPES } from "@/lib/constants";
import { splitEqually } from "@/lib/balances";

const createGroupSchema = z.object({
  name: z.string().trim().min(1, "Name your group").max(60),
  type: z.enum(GROUP_TYPES),
  defaultSplit: z.enum(SPLIT_TYPES),
  memberNames: z.array(z.string().trim().min(1)).max(30),
});

export async function createGroup(input: z.infer<typeof createGroupSchema>) {
  const parsed = createGroupSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await getCurrentUser();
  const { name, type, defaultSplit, memberNames } = parsed.data;

  const group = await db.group.create({
    data: {
      userId: user.id,
      name,
      type,
      defaultSplit,
      members: {
        create: [
          { name: "You", isCurrentUser: true },
          ...memberNames.map((n) => ({ name: n, isCurrentUser: false })),
        ],
      },
    },
  });

  revalidatePath("/groups");
  redirect(`/groups/${group.id}`);
}

const addExpenseSchema = z.object({
  groupId: z.string().min(1),
  description: z.string().trim().min(1, "Add a description").max(120),
  totalAmount: z.number().positive("Enter an amount greater than 0"),
  paidByMemberId: z.string().min(1),
  splitType: z.enum(["Equal", "Exact", "Percent"]),
  shares: z.record(z.string(), z.number()).optional(),
  selectedMemberIds: z.array(z.string()).optional(),
});

export async function addGroupExpense(input: z.infer<typeof addExpenseSchema>) {
  const parsed = addExpenseSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await getCurrentUser();
  const { groupId, description, totalAmount, paidByMemberId, splitType, shares, selectedMemberIds } = parsed.data;

  const group = await db.group.findFirst({ where: { id: groupId, userId: user.id }, include: { members: true } });
  if (!group) return { ok: false as const, error: "Group not found" };

  let finalShares: Record<string, number>;

  if (splitType === "Equal") {
    const ids = selectedMemberIds?.length ? selectedMemberIds : group.members.map((m) => m.id);
    finalShares = splitEqually(totalAmount, ids);
  } else if (splitType === "Percent") {
    if (!shares) return { ok: false as const, error: "Enter percentages" };
    const totalPct = Object.values(shares).reduce((s, v) => s + v, 0);
    if (Math.abs(totalPct - 100) > 0.5) return { ok: false as const, error: "Percentages must add up to 100" };
    finalShares = Object.fromEntries(Object.entries(shares).map(([id, pct]) => [id, Math.round((totalAmount * pct)) / 100]));
  } else {
    if (!shares) return { ok: false as const, error: "Enter exact amounts" };
    const totalShares = Object.values(shares).reduce((s, v) => s + v, 0);
    if (Math.abs(totalShares - totalAmount) > 0.5) return { ok: false as const, error: "Shares must add up to the total" };
    finalShares = shares;
  }

  await db.groupExpense.create({
    data: {
      groupId,
      description,
      totalAmount,
      paidByMemberId,
      splitType,
      splits: {
        create: Object.entries(finalShares).map(([memberId, shareAmount]) => ({ memberId, shareAmount })),
      },
    },
  });

  revalidatePath(`/groups/${groupId}`);
  redirect(`/groups/${groupId}`);
}

const settlementSchema = z.object({
  groupId: z.string().min(1),
  fromMemberId: z.string().min(1),
  toMemberId: z.string().min(1),
  amount: z.number().positive(),
  note: z.string().optional(),
});

export async function recordSettlement(input: z.infer<typeof settlementSchema>) {
  const parsed = settlementSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await getCurrentUser();
  const group = await db.group.findFirst({ where: { id: parsed.data.groupId, userId: user.id } });
  if (!group) return { ok: false as const, error: "Group not found" };

  await db.settlement.create({ data: parsed.data });

  revalidatePath(`/groups/${parsed.data.groupId}`);
  revalidatePath(`/groups/${parsed.data.groupId}/settle`);
  revalidatePath("/groups");
  return { ok: true as const };
}
