import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { HeroCard } from "@/components/ui/HeroCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getCurrentUser } from "@/lib/current-user";
import { buildFinancialContext } from "@/lib/financial-context";
import { computeHealthScore } from "@/lib/health-score";
import { cn } from "@/lib/cn";

function scoreTone(score: number) {
  if (score >= 70) return "text-cosfy-lime";
  if (score >= 40) return "text-cosfy-amber";
  return "text-cosfy-red";
}

export const metadata: Metadata = {
  title: "Financial health score",
  description: "See how healthy your finances are, and what to improve.",
};

export default async function HealthScorePage() {
  const user = await getCurrentUser();
  const context = await buildFinancialContext(user.id);
  const result = computeHealthScore(context);

  return (
    <PageContainer title="Financial health score" backHref="/home">
      <HeroCard className="mb-5">
        <p className="text-[13px] text-white/70 mb-1">Your score</p>
        {result.insufficientData ? (
          <p className="text-[15px] font-semibold text-white/90">
            Not enough data for a full financial health score.
          </p>
        ) : (
          <p className={cn("text-[48px] font-extrabold", scoreTone(result.score))}>{result.score}</p>
        )}
      </HeroCard>

      {!result.insufficientData ? (
        <div className="space-y-4">
          {result.dimensions.map((d) => (
            <div key={d.label}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[13px] font-semibold text-cosfy-ink">{d.label}</p>
                <p className="text-[12px] font-semibold text-cosfy-muted">{d.score}</p>
              </div>
              <ProgressBar value={d.score} max={100} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[13px] text-cosfy-muted">
          Add a few expenses, a budget, and a goal so we have enough to work with.
        </p>
      )}
    </PageContainer>
  );
}
