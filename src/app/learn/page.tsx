import Link from "next/link";
import { GraduationCap, ChevronRight } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { IconTile } from "@/components/ui/IconTile";
import { PillChip } from "@/components/ui/PillChip";
import { getCurrentUser } from "@/lib/current-user";
import { buildFinancialContext } from "@/lib/financial-context";
import { LESSONS, pickContextualLesson, type LessonCategory } from "@/lib/lessons";

const CATEGORIES: LessonCategory[] = ["Basics", "Debt", "Saving", "Invest", "Tax"];

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: rawCategory } = await searchParams;
  const category = CATEGORIES.find((c) => c === rawCategory);

  const user = await getCurrentUser();
  const context = await buildFinancialContext(user.id);
  const featured = pickContextualLesson(context);

  const lessons = category ? LESSONS.filter((l) => l.category === category) : LESSONS;

  return (
    <PageContainer title="Money School" backHref="/coach">
      <Link
        href={`/learn/${featured.id}`}
        className="block rounded-card bg-cosfy-dark-card text-cosfy-dark-card-text p-5 mb-5"
      >
        <p className="text-[12px] text-white/60 mb-1">Picked for you</p>
        <p className="text-[17px] font-extrabold text-white mb-1">{featured.title}</p>
        <p className="text-[13px] text-white/70">{featured.summary}</p>
      </Link>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        <Link href="/learn">
          <PillChip variant={!category ? "active" : "inactive"} type="button">
            All
          </PillChip>
        </Link>
        {CATEGORIES.map((c) => (
          <Link key={c} href={`/learn?category=${c}`}>
            <PillChip variant={category === c ? "active" : "inactive"} type="button">
              {c}
            </PillChip>
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {lessons.map((lesson) => (
          <Link
            key={lesson.id}
            href={`/learn/${lesson.id}`}
            className="flex items-center gap-3 rounded-card bg-cosfy-card border border-cosfy-border p-3.5"
          >
            <IconTile icon={GraduationCap} tone="soft" size={40} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-cosfy-ink truncate">{lesson.title}</p>
              <p className="text-[11px] text-cosfy-muted">{lesson.category}</p>
            </div>
            <ChevronRight size={18} className="text-cosfy-muted shrink-0" />
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}
