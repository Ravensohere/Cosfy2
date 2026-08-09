import { CalendarDays, CreditCard, Landmark, ShieldCheck, Repeat, Target } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { nextDueDate, daysUntil, dueUrgency } from "@/lib/credit-card-status";

type CalendarEntry = {
  label: string;
  date: Date;
  amount: number;
  icon: typeof CreditCard;
  href: string;
};

const URGENCY_STYLES = {
  overdue: "text-cosfy-red",
  soon: "text-cosfy-amber",
  upcoming: "text-cosfy-muted",
  paid: "text-cosfy-green",
};

export default async function CalendarPage() {
  const user = await getCurrentUser();
  const [creditCards, loans, policies, subscriptions, goals] = await Promise.all([
    db.creditCard.findMany({ where: { userId: user.id } }),
    db.loan.findMany({ where: { userId: user.id } }),
    db.insurancePolicy.findMany({ where: { userId: user.id } }),
    db.subscription.findMany({ where: { userId: user.id, isActive: true } }),
    db.goal.findMany({ where: { userId: user.id, targetDate: { not: null } } }),
  ]);

  const entries: CalendarEntry[] = [
    ...creditCards
      .filter((c) => c.currentDue > 0)
      .map((c) => ({ label: `${c.name} bill`, date: nextDueDate(c.dueDay), amount: c.currentDue, icon: CreditCard, href: "/credit-cards" })),
    ...loans.map((l) => ({ label: `${l.name} EMI`, date: nextDueDate(l.dueDay), amount: l.emiAmount, icon: Landmark, href: "/loans" })),
    ...policies.map((p) => ({ label: `${p.policyName} renewal`, date: p.nextRenewalDate, amount: p.premiumAmount, icon: ShieldCheck, href: "/insurance" })),
    ...subscriptions.map((s) => ({ label: `${s.name} renewal`, date: s.nextRenewalDate, amount: s.amount, icon: Repeat, href: "/subscriptions" })),
    ...goals.map((g) => ({ label: `${g.name} target date`, date: g.targetDate as Date, amount: g.targetAmount, icon: Target, href: `/goals/${g.id}` })),
  ];

  const sixtyDaysOut = new Date();
  sixtyDaysOut.setDate(sixtyDaysOut.getDate() + 60);

  const upcoming = entries
    .filter((e) => e.date <= sixtyDaysOut)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const grouped = new Map<string, CalendarEntry[]>();
  for (const entry of upcoming) {
    const key = entry.date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    const group = grouped.get(key);
    if (group) group.push(entry);
    else grouped.set(key, [entry]);
  }

  return (
    <PageContainer title="Cash-flow calendar" backHref="/home">
      {upcoming.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nothing due in the next 60 days"
          description="Credit card bills, EMIs, insurance renewals, subscriptions, and goal target dates will show up here."
        />
      ) : (
        <div className="space-y-6">
          {[...grouped.entries()].map(([month, monthEntries]) => (
            <div key={month}>
              <h2 className="text-[13px] font-bold text-cosfy-muted mb-2">{month}</h2>
              <div className="space-y-2.5">
                {monthEntries.map((entry, i) => {
                  const days = daysUntil(entry.date);
                  const urgency = dueUrgency(days, entry.amount);
                  const Icon = entry.icon;
                  return (
                    <a
                      key={i}
                      href={entry.href}
                      className="flex items-center gap-3 rounded-card bg-cosfy-card border border-cosfy-border p-3.5"
                    >
                      <Icon size={18} className="text-cosfy-ink-soft shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-cosfy-ink truncate">{entry.label}</p>
                        <p className={`text-[11px] font-semibold ${URGENCY_STYLES[urgency]}`}>
                          {entry.date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} ·{" "}
                          {days === 0 ? "Today" : days > 0 ? `In ${days}d` : `${Math.abs(days)}d ago`}
                        </p>
                      </div>
                      <MoneyAmount amount={entry.amount} size="sm" />
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
