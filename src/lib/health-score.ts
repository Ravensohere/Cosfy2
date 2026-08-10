import type { FinancialContext } from "@/lib/financial-context";

export type HealthDimension = { label: string; score: number };

export type HealthScoreResult = {
  score: number;
  dimensions: HealthDimension[];
  insufficientData: boolean;
};

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(Math.min(100, Math.max(0, value)));
}

export function computeHealthScore(ctx: FinancialContext): HealthScoreResult {
  if (!ctx.hasEnoughData) {
    return { score: 0, dimensions: [], insufficientData: true };
  }

  // 1. Monthly surplus / savings rate, reward a healthy positive surplus, penalize deficits.
  const surplus = ctx.averageMonthlySurplus ?? 0;
  const surplusScore = clampScore(50 + (surplus / Math.max(ctx.spentThisMonth, 1)) * 100);

  // 2. Debt burden, liabilities as a share of assets; lower is better.
  const debtRatio = ctx.netWorth.totalLiabilities / Math.max(ctx.netWorth.totalAssets, 1);
  const debtScore = clampScore(100 - debtRatio * 100);

  // 3. Emergency fund, bank balance vs. ~3 months of current spend.
  const emergencyTarget = Math.max(ctx.spentThisMonth * 3, 1);
  const emergencyScore = clampScore((ctx.netWorth.bankBalance / emergencyTarget) * 100);

  // 4. Budget discipline, share of active budgets kept under their alert threshold.
  const budgetScore =
    ctx.budgets.length > 0
      ? clampScore(
          (ctx.budgets.filter((b) => b.limit <= 0 || b.spent / b.limit < b.alertThreshold / 100).length /
            ctx.budgets.length) *
            100
        )
      : 50;

  // 5. Goal progress, average completion across active goals.
  const goalScore =
    ctx.goals.length > 0
      ? clampScore(
          (ctx.goals.reduce((sum, g) => sum + Math.min(g.saved / Math.max(g.targetAmount, 1), 1), 0) / ctx.goals.length) *
            100
        )
      : 50;

  // 6. Insurance / protection, coarse check for any policy on file.
  const insuranceScore = ctx.insurancePolicies.length > 0 ? 100 : 20;

  const dimensions: HealthDimension[] = [
    { label: "Monthly surplus", score: surplusScore },
    { label: "Debt burden", score: debtScore },
    { label: "Emergency fund", score: emergencyScore },
    { label: "Budget discipline", score: budgetScore },
    { label: "Goal progress", score: goalScore },
    { label: "Insurance & protection", score: insuranceScore },
  ];

  const score = clampScore(dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length);

  return { score, dimensions, insufficientData: false };
}
