import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { PageContainer } from "@/components/layout/PageContainer";
import { computeMemberBalances, simplifyDebts } from "@/lib/balances";
import { SettleList } from "./SettleList";

export const metadata: Metadata = { title: "Settle up" };

export default async function SettleGroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const user = await getCurrentUser();
  const group = await db.group.findFirst({
    where: { id: groupId, userId: user.id },
    include: {
      members: true,
      expenses: { include: { splits: true } },
      settlements: true,
    },
  });

  if (!group) notFound();

  const memberName = (id: string) => group.members.find((m) => m.id === id)?.name ?? "Unknown";
  const balances = computeMemberBalances(
    group.members.map((m) => m.id),
    group.expenses,
    group.settlements
  );
  const debts = simplifyDebts(balances).map((d) => ({
    fromMemberId: d.fromMemberId,
    fromName: memberName(d.fromMemberId),
    toMemberId: d.toMemberId,
    toName: memberName(d.toMemberId),
    amount: d.amount,
  }));

  return (
    <PageContainer title="Settle up" backHref={`/groups/${group.id}`}>
      <SettleList groupId={group.id} groupName={group.name} debts={debts} />
    </PageContainer>
  );
}
