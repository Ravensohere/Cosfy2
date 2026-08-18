import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { PageContainer } from "@/components/layout/PageContainer";
import { EditItemsForm } from "./EditItemsForm";

export const metadata: Metadata = { title: "Edit scanned items" };

export default async function EditBillItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ groupId?: string }>;
}) {
  const { groupId } = await searchParams;
  const user = await getCurrentUser();

  let groupMembers: { id: string; name: string }[] | null = null;
  if (groupId) {
    const group = await db.group.findFirst({ where: { id: groupId, userId: user.id }, include: { members: true } });
    if (group) {
      groupMembers = group.members.map((m) => ({ id: m.id, name: m.name }));
    }
  }

  return (
    <PageContainer title="Bill details" backHref={groupId ? `/groups/${groupId}/add-expense` : "/home"}>
      <EditItemsForm groupId={groupId ?? null} groupMembers={groupMembers} />
    </PageContainer>
  );
}
