import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { PageContainer } from "@/components/layout/PageContainer";
import { ParticipantsForm } from "./ParticipantsForm";

export default async function ScanParticipantsPage() {
  const user = await getCurrentUser();
  const groups = await db.group.findMany({
    where: { userId: user.id },
    include: { members: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PageContainer title="Who's splitting?" backHref="/scan/edit-items">
      <ParticipantsForm
        groups={groups.map((g) => ({
          id: g.id,
          name: g.name,
          members: g.members.map((m) => ({ id: m.id, name: m.name })),
        }))}
      />
    </PageContainer>
  );
}
