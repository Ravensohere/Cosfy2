import { CosfyMascot, type MascotMood } from "@/components/ui/CosfyMascot";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { getCurrentUser } from "@/lib/current-user";
import { buildFinancialContext } from "@/lib/financial-context";

const SUGGESTED_QUESTIONS = [
  "Where did my money go this month?",
  "Can I afford a new phone?",
  "How do I save ₹10k a month?",
];

export default async function CoachPage() {
  const user = await getCurrentUser();
  const name = user.preferredName ? `, ${user.preferredName}` : "";
  const context = await buildFinancialContext(user.id);
  const mood: MascotMood = !context.hasEnoughData
    ? "neutral"
    : (context.averageMonthlySurplus ?? 0) >= 0
      ? "happy"
      : "concerned";

  return (
    <div className="px-5 pt-6 pb-28 md:px-10 md:pt-10 md:max-w-2xl md:mx-auto h-dvh flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <CosfyMascot mood={mood} size={44} />
        <div>
          <p className="text-[13px] text-cosfy-muted">Cosfy Coach</p>
          <p className="text-[18px] font-extrabold text-cosfy-ink">Hey{name}, ask me anything</p>
        </div>
      </div>
      <ChatWindow
        greeting="I can look at your real transactions, budgets, goals, and cards to answer questions about your money. Not a licensed advisor — treat this as information, not instructions."
        suggestedQuestions={SUGGESTED_QUESTIONS}
      />
    </div>
  );
}
