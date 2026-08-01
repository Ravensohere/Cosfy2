import Link from "next/link";
import { MoneyAmount } from "@/components/ui/MoneyAmount";

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

  return (
    <Link href={`/groups/${id}`} className="flex items-center justify-between rounded-card bg-cosfy-card border border-cosfy-border p-4 shadow-soft">
      <div>
        <p className="font-bold text-[14px] text-cosfy-ink">{name}</p>
        <p className="text-[12px] text-cosfy-muted">
          {type} · {memberCount} {memberCount === 1 ? "member" : "members"}
        </p>
      </div>
      <div className="text-right">
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
