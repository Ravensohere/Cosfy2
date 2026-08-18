import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { PageContainer } from "@/components/layout/PageContainer";
import { AddExpenseForm } from "./AddExpenseForm";

export const metadata: Metadata = { title: "Add group expense" };

export default async function AddGroupExpensePage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const user = await getCurrentUser();
  const group = await db.group.findFirst({
    where: { id: groupId, userId: user.id },
    include: { members: true },
  });

  if (!group) notFound();

  return (
    <PageContainer title="Add expense" backHref={`/groups/${group.id}`}>
      <AddExpenseForm
        groupId={group.id}
        members={group.members
          .filter((m) => !m.removedAt)
          .map((m) => ({ id: m.id, name: m.name, isCurrentUser: m.isCurrentUser }))}
      />
    </PageContainer>
  );
}
