import { User } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { PageContainer } from "@/components/layout/PageContainer";
import { IconTile } from "@/components/ui/IconTile";
import { ProfileSettings } from "./ProfileSettings";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  const [billsScanned, groupsCount, goals] = await Promise.all([
    db.groupExpense.count({ where: { splitType: "ByItem", group: { userId: user.id } } }),
    db.group.count({ where: { userId: user.id } }),
    db.goal.findMany({ where: { userId: user.id }, include: { contributions: true } }),
  ]);

  const addedToGoals = goals.reduce((sum, g) => sum + g.contributions.reduce((s, c) => s + c.amount, 0), 0);

  return (
    <PageContainer title="Profile">
      <div className="rounded-[22px] bg-cosfy-dark-card text-white p-5 mb-4 flex items-center gap-4">
        <IconTile icon={User} tone="lime" size={56} />
        <div>
          <p className="font-extrabold text-[17px]">Cosfy guest</p>
          <p className="text-[12px] text-white/60">Local guest account</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        <StatTile label="Bills scanned" value={billsScanned} />
        <StatTile label="Groups" value={groupsCount} />
        <StatTile label="Added to goals" value={`₹${new Intl.NumberFormat("en-IN").format(Math.round(addedToGoals))}`} />
      </div>

      <ProfileSettings notificationsEnabled={user.notificationsEnabled} />
    </PageContainer>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-card bg-cosfy-card border border-cosfy-border p-3 text-center">
      <p className="font-extrabold text-[16px] text-cosfy-ink">{value}</p>
      <p className="text-[10px] text-cosfy-muted mt-0.5">{label}</p>
    </div>
  );
}
