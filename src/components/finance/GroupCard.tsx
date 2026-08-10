import Link from "next/link";
import { Plane, Home, Heart, Briefcase, Users, Users2, type LucideIcon } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import { MoneyAmount } from "@/components/ui/MoneyAmount";

const TYPE_ICONS: Record<string, LucideIcon> = {
  Trip: Plane,
  Flatmates: Home,
  Couple: Heart,
  Office: Briefcase,
  Friends: Users,
  Family: Users2,
};

export function GroupCard({
  id,
  name,
  type,
  memberCount,
  yourBalance,
}: {
  id: string;
  name: string;
  type: string;
  memberCount: number;
  yourBalance: number;
}) {
  const settled = Math.abs(yourBalance) < 0.5;
  const Icon = TYPE_ICONS[type] ?? Users;

  return (
    <Link href={`/groups/${id}`} className="flex items-center gap-3 rounded-card bg-cosfy-card border border-cosfy-border p-4 shadow-soft">
      <IconTile icon={Icon} tone="dark" size={44} />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[14px] text-cosfy-ink truncate">{name}</p>
        <p className="text-[12px] text-cosfy-muted">
          {type} · {memberCount} {memberCount === 1 ? "member" : "members"}
        </p>
      </div>
      <div className="text-right shrink-0">
        {settled ? (
          <span className="text-[12px] font-semibold text-cosfy-muted">Settled</span>
        ) : (
          <>
            <p className="text-[11px] text-cosfy-muted">{yourBalance > 0 ? "You'll receive" : "You owe"}</p>
            <MoneyAmount
              amount={Math.abs(yourBalance)}
              size="md"
              className={yourBalance > 0 ? "text-cosfy-green" : "text-cosfy-red"}
            />
          </>
        )}
      </div>
    </Link>
  );
}
