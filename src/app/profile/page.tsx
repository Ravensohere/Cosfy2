import { User } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { PageContainer } from "@/components/layout/PageContainer";
import { IconTile } from "@/components/ui/IconTile";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ProfileSettings } from "./ProfileSettings";

const GMAIL_STATUS_MESSAGES: Record<string, { text: string; tone: "success" | "error" }> = {
  connected: { text: "Gmail connected. Tap \"Sync now\" below to pull in transactions.", tone: "success" },
  error: { text: "Couldn't connect Gmail. Try again.", tone: "error" },
  "not-configured": { text: "Gmail import isn't set up on the server yet.", tone: "error" },
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ gmail?: string }>;
}) {
  const user = await getCurrentUser();
  const { gmail } = await searchParams;
  const gmailStatus = gmail ? GMAIL_STATUS_MESSAGES[gmail] : undefined;

  const [billsScanned, groupsCount, goals] = await Promise.all([
    db.groupExpense.count({ where: { splitType: "ByItem", group: { userId: user.id } } }),
    db.group.count({ where: { userId: user.id } }),
    db.goal.findMany({ where: { userId: user.id }, include: { contributions: true } }),
  ]);

  const addedToGoals = goals.reduce((sum, g) => sum + g.contributions.reduce((s, c) => s + c.amount, 0), 0);

  return (
    <PageContainer title="Profile">
      {gmailStatus ? (
        <p
          className={`text-[13px] font-semibold rounded-card p-3 mb-4 ${
            gmailStatus.tone === "success"
              ? "bg-cosfy-lime-pale text-cosfy-lime-ink border border-cosfy-lime-soft"
              : "bg-cosfy-red-soft text-cosfy-red border border-cosfy-red/20"
          }`}
        >
          {gmailStatus.text}
        </p>
      ) : null}
      <div className="rounded-[22px] bg-cosfy-dark-card text-white p-5 mb-4 flex items-center gap-4" data-tour="profile-header">
        <IconTile icon={User} tone="lime" size={56} />
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-[17px] truncate">
            {user.preferredName || user.displayName || user.email || user.phoneNumber || "Cosfy guest"}
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

      <ProfileSettings
        notificationsEnabled={user.notificationsEnabled}
        roundUpEnabled={user.roundUpEnabled}
        roundUpIncrement={user.roundUpIncrement}
        roundUpGoalId={user.roundUpGoalId}
        goals={goals.map((g) => ({ id: g.id, name: g.name }))}
        appLockEnabled={user.appLockEnabled}
        preferredName={user.preferredName}
        age={user.age}
        gmailConnected={user.gmailConnected}
        gmailEmail={user.gmailEmail}
      />
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
