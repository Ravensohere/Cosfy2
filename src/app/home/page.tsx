import { redirect } from "next/navigation";
import { Receipt, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { HeroCard } from "@/components/ui/HeroCard";
import { StatCard } from "@/components/ui/StatCard";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { EmptyState } from "@/components/ui/EmptyState";
import { CosfyMascot, type MascotMood } from "@/components/ui/CosfyMascot";
import { TransactionRow } from "@/components/finance/TransactionRow";
import { QuickActionLink } from "@/components/home/QuickActionButton";
import { fetchFinanceHeadlines } from "@/lib/news-feed";
import { getNetWorthBreakdown } from "@/lib/actions/net-worth";
import { NetWorthWidget } from "@/components/home/NetWorthWidget";
import { StreakBadge } from "@/components/home/StreakBadge";
import { MonthWindowPicker } from "@/components/ui/MonthWindowPicker";
import { computeNoSpendStreak, computeLoggingStreak } from "@/lib/streaks";
import { translate, SUPPORTED_LANGUAGES, type Language } from "@/lib/i18n/dictionary";
import Link from "next/link";

function parseMonthParam(m: string | undefined) {
  if (m && /^\d{4}-\d{2}$/.test(m)) {
    const [year, month] = m.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function monthParam(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user.onboardingCompleted) {
    redirect("/onboarding/goal");
  }

  const { m } = await searchParams;
  const monthStart = parseMonthParam(m);
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
  const isCurrentMonth = monthParam(monthStart) === monthParam(new Date());
  const prevMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1);
  const nextMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);

  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const [monthTransactions, recentTransactions, headlines, netWorth, streakTransactions] = await Promise.all([
    db.transaction.findMany({
      where: { userId: user.id, date: { gte: monthStart, lt: monthEnd } },
    }),
    db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 5,
    }),
    fetchFinanceHeadlines(3),
    getNetWorthBreakdown(user.id),
    db.transaction.findMany({
      where: { userId: user.id, date: { gte: sixtyDaysAgo } },
      select: { date: true, amount: true },
    }),
  ]);

  const noSpendStreak = computeNoSpendStreak(streakTransactions);
  const loggingStreak = computeLoggingStreak(streakTransactions);

  const income = monthTransactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const spent = monthTransactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const surplus = income - spent;

  const mascotMood: MascotMood = monthTransactions.length === 0 ? "neutral" : surplus >= 0 ? "happy" : "concerned";
  const lang: Language = SUPPORTED_LANGUAGES.includes(user.language as Language) ? (user.language as Language) : "en";
  const t = (key: Parameters<typeof translate>[1]) => translate(lang, key);

  return (
    <div className="px-5 pt-6 pb-28 md:px-10 md:pt-10 md:max-w-2xl md:mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CosfyMascot mood={mascotMood} size={44} />
          <div>
            {user.preferredName ? (
              <>
                <p className="text-[13px] text-cosfy-muted">{t("home.welcomeBack")}</p>
                <p className="text-[18px] font-extrabold text-cosfy-ink">
                  {t("home.greetingNamed").replace("{name}", user.preferredName)}
                </p>
              </>
            ) : (
              <>
                <p className="text-[13px] text-cosfy-muted">{t("home.greeting")}</p>
                <p className="text-[18px] font-extrabold text-cosfy-ink">{t("home.welcome")}</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mb-2">
        <Link
          href={`/home?m=${monthParam(prevMonth)}`}
          aria-label="Previous month"
          className="w-7 h-7 flex items-center justify-center rounded-full bg-cosfy-card-soft text-cosfy-muted"
        >
          <ChevronLeft size={16} />
        </Link>
        <MonthWindowPicker value={monthParam(monthStart)} basePath="/home" />
        {isCurrentMonth ? (
          <span className="w-7 h-7" />
        ) : (
          <Link
            href={`/home?m=${monthParam(nextMonth)}`}
            aria-label="Next month"
            className="w-7 h-7 flex items-center justify-center rounded-full bg-cosfy-card-soft text-cosfy-muted"
          >
            <ChevronRight size={16} />
          </Link>
        )}
      </div>

      <HeroCard>
        <p className="text-[13px] text-white/70 mb-1">{t("home.spending")}</p>
        <MoneyAmount amount={spent} size="hero" className="text-white" />
      </HeroCard>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <StatCard label={t("home.income")} amount={income} />
        <StatCard label={t("home.surplus")} amount={surplus} />
      </div>

      <div className="grid grid-cols-2 gap-2 mt-6 max-w-[220px] mx-auto">
        <QuickActionLink href="/scan/edit-items" icon="Receipt" label="Split bill" />
        <QuickActionLink href="/groups" icon="Users" label="Groups" />
      </div>

      <div className="rounded-card bg-cosfy-lime-pale border border-cosfy-lime-soft p-4 mt-6">
        <p className="text-[13px] font-semibold text-cosfy-lime-ink">
          {monthTransactions.length === 0
            ? "Add your first expense to get personalised insights."
            : `You've logged ${monthTransactions.length} transaction${monthTransactions.length === 1 ? "" : "s"} this month.`}
        </p>
      </div>

      <div className="mt-6">
        <StreakBadge noSpendStreak={noSpendStreak} loggingStreak={loggingStreak} />
      </div>

      <div className="mt-6">
        <NetWorthWidget netWorth={netWorth.netWorth} />
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[15px] font-extrabold text-cosfy-ink">{t("home.recentActivity")}</h2>
          {recentTransactions.length > 0 && (
            <Link href="/transactions" className="text-[12px] font-semibold text-cosfy-lime-deep">
              {t("home.seeAll")}
            </Link>
          )}
        </div>
        {recentTransactions.length === 0 ? (
          <EmptyState icon={Receipt} title={t("home.noExpenses")} description={t("home.tapToAdd")} />
        ) : (
          <div className="space-y-2.5">
            {recentTransactions.map((t) => (
              <TransactionRow
                key={t.id}
                description={t.description}
                category={t.category}
                paymentMode={t.paymentMode}
                amount={t.amount}
                date={t.date}
              />
            ))}
          </div>
        )}
      </div>

      {headlines.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[15px] font-extrabold text-cosfy-ink">{t("home.financeNews")}</h2>
            <Link href="/news" className="text-[12px] font-semibold text-cosfy-lime-deep">
              {t("home.seeAll")}
            </Link>
          </div>
          <div className="space-y-2.5">
            {headlines.map((h, i) => (
              <a
                key={i}
                href={h.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between gap-2 rounded-card bg-cosfy-card border border-cosfy-border p-3.5"
              >
                <div>
                  <p className="text-[13px] font-semibold text-cosfy-ink leading-snug">{h.title}</p>
                  <p className="text-[11px] text-cosfy-muted mt-1">{h.source}</p>
                </div>
                <ExternalLink size={14} className="text-cosfy-muted shrink-0 mt-0.5" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
