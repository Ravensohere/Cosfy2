import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { PageContainer } from "@/components/layout/PageContainer";
import { computeMemberBalances } from "@/lib/balances";
import { EditGroupForm } from "./EditGroupForm";

export default async function EditGroupPage({ params }: { params: Promise<{ groupId: string }> }) {
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

  const activeMembers = group.members.filter((m) => !m.removedAt);
  const balances = computeMemberBalances(
    group.members.map((m) => m.id),
    group.expenses,
    group.settlements
  );
  const totalSpent = group.expenses.reduce((sum, e) => sum + e.totalAmount, 0);

  return (
    <PageContainer title="Edit group" backHref={`/groups/${group.id}`}>
      <EditGroupForm
        groupId={group.id}
        initialName={group.name}
        members={activeMembers.map((m) => ({ id: m.id, name: m.name, isCurrentUser: m.isCurrentUser }))}
        totalSpent={totalSpent}
        memberBalances={activeMembers.map((m) => ({ name: m.name, balance: balances[m.id] ?? 0 }))}
      />
    </PageContainer>
  );
}
