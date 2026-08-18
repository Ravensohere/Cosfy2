import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { PillChip } from "@/components/ui/PillChip";
import { LESSONS } from "@/lib/lessons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = LESSONS.find((l) => l.id === lessonId);
  return { title: lesson?.title ?? "Lesson" };
}

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const lesson = LESSONS.find((l) => l.id === lessonId);
  if (!lesson) notFound();

  return (
    <PageContainer backHref="/learn">
      <PillChip variant="strong" className="mb-4 pointer-events-none">
        {lesson.category}
      </PillChip>
      <h1 className="text-[22px] font-extrabold text-cosfy-ink mb-4">{lesson.title}</h1>
      <div className="space-y-4">
        {lesson.body
          .split("\n\n")
          .map((para, i) => (
            <p key={i} className="text-[14px] leading-relaxed text-cosfy-ink-soft">
              {para}
            </p>
          ))}
      </div>
    </PageContainer>
  );
}
