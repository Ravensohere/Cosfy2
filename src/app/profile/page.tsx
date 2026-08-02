import { User } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { PageContainer } from "@/components/layout/PageContainer";
import { IconTile } from "@/components/ui/IconTile";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ApiKeySettings } from "@/components/profile/ApiKeySettings";
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
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-[17px] truncate">
            {user.displayName || user.email || user.phoneNumber || "Cosfy guest"}
          </p>
          <p className="text-[12px] text-white/60 truncate">
            {user.email || user.phoneNumber || "Local guest account"}
          </p>
        </div>
        {!user.firebaseUid ? (
          <PrimaryButton href="/sign-in" className="h-9 px-4 text-[13px] shrink-0">
            Sign in
          </PrimaryButton>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        <StatTile label="Bills scanned" value={billsScanned} />
        <StatTile label="Groups" value={groupsCount} />
        <StatTile label="Added to goals" value={`₹${new Intl.NumberFormat("en-IN").format(Math.round(addedToGoals))}`} />
      </div>

      <div className="mb-3">
        <ApiKeySettings keyPreview={user.openaiApiKey ? `sk-...${user.openaiApiKey.slice(-4)}` : null} />
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
