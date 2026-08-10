import { redirect } from "next/navigation";
import Link from "next/link";
import { GraduationCap, ChevronRight } from "lucide-react";
import { CosfyMascot, type MascotMood } from "@/components/ui/CosfyMascot";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { getCurrentUser } from "@/lib/current-user";
import { buildFinancialContext } from "@/lib/financial-context";
import { pickContextualLesson } from "@/lib/lessons";

const SUGGESTED_QUESTIONS = [
  "Where did my money go this month?",
  "Can I afford a new phone?",
  "How do I save ₹10k a month?",
];

export default async function CoachPage() {
  const user = await getCurrentUser();
  if (!user.onboardingCompleted) {
    redirect("/onboarding/goal");
  }
  const name = user.preferredName ? `, ${user.preferredName}` : "";
  const context = await buildFinancialContext(user.id);
  const mood: MascotMood = !context.hasEnoughData
    ? "neutral"
    : (context.averageMonthlySurplus ?? 0) >= 0
      ? "happy"
      : "concerned";
  const lesson = pickContextualLesson(context);

  return (
    <div className="px-5 pt-6 pb-28 md:px-10 md:pt-10 md:max-w-2xl md:mx-auto h-dvh flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <CosfyMascot mood={mood} size={44} />
        <div>
          <p className="text-[13px] text-cosfy-muted">Cosfy Coach</p>
          <p className="text-[18px] font-extrabold text-cosfy-ink">Hey{name}, ask me anything</p>
        </div>
      </div>
      <Link
        href={`/learn/${lesson.id}`}
        className="flex items-center gap-3 rounded-card bg-cosfy-card-soft border border-cosfy-border p-3 mb-4 shrink-0"
      >
        <GraduationCap size={18} className="text-cosfy-ink-soft shrink-0" />
        <span className="flex-1 min-w-0 text-[12px] font-semibold text-cosfy-ink truncate">{lesson.title}</span>
        <ChevronRight size={16} className="text-cosfy-muted shrink-0" />
      </Link>
      <ChatWindow
        greeting="I can look at your real transactions, budgets, goals, and cards to answer questions about your money. I'm not a licensed advisor, so treat this as information, not instructions."
        suggestedQuestions={SUGGESTED_QUESTIONS}
        allowVoice
      />
    </div>
  );
}
