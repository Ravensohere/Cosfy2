import type { FinancialContext } from "@/lib/financial-context";

export type LessonCategory = "Basics" | "Debt" | "Saving" | "Invest" | "Tax";

export type Lesson = {
  id: string;
  category: LessonCategory;
  title: string;
  summary: string;
  body: string;
};

export const LESSONS: Lesson[] = [
  {
    id: "money-flow-basics",
    category: "Basics",
    title: "How your money actually flows",
    summary: "Income minus fixed costs minus variable spend — the one equation that matters.",
    body: `Every rupee you earn goes through the same three buckets: fixed costs (rent, EMIs, insurance premiums — things that don't change month to month), variable spend (food, shopping, entertainment — things you control), and whatever's left over, your surplus.

Most budgeting advice fails because it starts with variable spend ("stop ordering food") instead of the full picture. Before you cut anything, know your three numbers: what comes in, what's fixed, what's left. If fixed costs already eat most of your income, no amount of skipping chai will fix it — you need to look at the fixed side (renegotiate, refinance, downsize).

If variable spend is eating your surplus instead, that's where daily habits actually help. Knowing which problem you have changes what's worth your effort.`,
  },
  {
    id: "insurance-basics",
    category: "Basics",
    title: "Why insurance isn't optional",
    summary: "One uninsured hospital visit can undo years of saving.",
    body: `Savings protect you from small, expected costs. Insurance protects you from large, unexpected ones — a hospitalization, an accident, a sudden loss of income. These aren't the same problem, and one can't substitute for the other.

A single serious hospital stay in India can run into lakhs. Without health cover, that bill comes straight out of savings, investments, or a loan — undoing years of careful budgeting in one event. Health insurance (even a basic policy) and, if anyone depends on your income, term life insurance are the two that matter most before anything else, including investing.

Cheap term insurance is one of the least glamorous financial products and one of the highest-value ones — it's pure protection, no returns, and that's exactly the point.`,
  },
  {
    id: "credit-card-interest",
    category: "Debt",
    title: "What your credit card minimum-due really costs",
    summary: "Paying just the minimum can mean 40%+ annualized interest.",
    body: `Paying only the "minimum due" on a credit card feels responsible — you're not missing a payment. But credit card interest in India often runs 3–3.5% per month on the revolving balance, which compounds to roughly 40-45% a year. That's far higher than almost any loan.

Worse: once you carry a balance, the interest-free period on new purchases usually disappears too — every new swipe starts accruing interest immediately, not just the old balance.

The fix isn't complicated, just hard: pay the full statement balance every cycle, not the minimum. If you're already carrying a balance, treat clearing it as the single highest-priority use of any spare cash — no investment reliably beats a guaranteed 40% "return" from not paying that interest.`,
  },
  {
    id: "good-vs-bad-debt",
    category: "Debt",
    title: "Good debt vs bad debt",
    summary: "Not all borrowing is equal — what separates them is what it's used for.",
    body: `Debt itself isn't the enemy — what it's used for is. A home loan or education loan usually funds something that grows your net worth or earning power over time, at relatively low interest. That's "good debt" — still a real obligation, but a reasonable trade.

"Bad debt" is borrowing for things that lose value the moment you buy them — a phone on EMI, a vacation on a personal loan, everyday spending on a credit card you can't pay off — usually at much higher interest, with nothing appreciating to offset it.

A simple filter before taking on debt: will this still have value, financial or otherwise, by the time I've finished paying it off? If the answer's no, it's worth pausing before signing up.`,
  },
  {
    id: "emergency-fund",
    category: "Saving",
    title: "The 3-month rule: building an emergency fund",
    summary: "A buffer big enough to survive a job loss or medical bill without new debt.",
    body: `An emergency fund is money set aside for the specific job of absorbing a shock — job loss, medical bill, urgent repair — without forcing you into debt or breaking a long-term investment early.

A common starting target: 3 months of essential expenses (rent, food, EMIs, utilities — not discretionary spend) sitting somewhere accessible within a day or two, like a savings account or a liquid fund. Not invested in anything that can drop in value right when you need it.

It doesn't need to happen overnight. Even a small automatic transfer each month, treated like any other fixed cost, builds this faster than it feels like it should — and once it exists, every other financial decision gets less stressful, because a bad month stops being a crisis.`,
  },
  {
    id: "zero-based-budget",
    category: "Saving",
    title: "Give every rupee a job",
    summary: "A budgeting method where nothing is left unassigned.",
    body: `Most budgets are really just spending trackers — they tell you what happened after the month's over. Zero-based budgeting flips that: before the month starts, you assign every rupee of expected income to a category — rent, food, savings, fun money — until nothing's left unassigned. Income minus all assignments equals zero.

The point isn't restriction, it's intention. "Fun money" is a real, allowed category — it just has a limit you chose in advance, instead of finding out by accident on the 28th that there's nothing left for essentials.

You don't need a spreadsheet to start. Even a rough version — "this much for essentials, this much for wants, this much for savings, decided before the month begins" — captures most of the benefit.`,
  },
  {
    id: "sip-index-funds",
    category: "Invest",
    title: "SIPs, index funds, and why starting small beats waiting",
    summary: "Consistency and time matter more than picking the perfect investment.",
    body: `A SIP (Systematic Investment Plan) is just automating a fixed amount into a fund every month, regardless of whether the market's up or down. Over time this smooths out the effect of short-term ups and downs — you buy more units when prices are low, fewer when they're high, without having to time anything.

An index fund simply tracks a market index (like the Nifty 50) instead of trying to pick individual winning stocks — lower cost, no reliance on a fund manager guessing right, and historically hard for most active funds to consistently beat.

The biggest lever most people underuse isn't fund selection — it's time. ₹2,000 a month starting today usually beats ₹5,000 a month starting three years from now, because growth compounds on however long the money's been invested, not how much you eventually contribute.

This isn't a recommendation to buy any specific fund — talk to a licensed advisor before investing. It's here so the vocabulary isn't a barrier to asking the right questions.`,
  },
  {
    id: "tax-regime-choice",
    category: "Tax",
    title: "Old regime vs new regime — how to actually decide",
    summary: "The right choice depends on how many deductions you actually claim.",
    body: `India's income tax system gives you a choice each year: the old regime (higher slab rates, but you can claim deductions — 80C investments, HRA, home loan interest, and more) or the new regime (lower slab rates, but almost no deductions).

The decision isn't about which is "better" in general — it's arithmetic specific to you. If your deductions (80C investments, HRA, insurance premiums, etc.) add up to a large number relative to your income, the old regime often wins. If you don't have many deductions to claim — common for people early in their career without a home loan or big 80C investments — the new regime's lower rates usually come out ahead.

The only reliable way to know is to actually calculate both ways using your real numbers before filing, not assume one is always right.`,
  },
];

export function pickContextualLesson(context: FinancialContext): Lesson {
  const byId = (id: string) => LESSONS.find((l) => l.id === id)!;

  const urgentCardDue = context.creditCards.some((c) => c.due > 0 && (c.urgency === "overdue" || c.urgency === "soon"));
  if (urgentCardDue) return byId("credit-card-interest");

  if (context.insurancePolicies.length === 0) return byId("insurance-basics");

  const overBudget = context.budgets.some((b) => b.limit > 0 && b.spent / b.limit >= b.alertThreshold / 100);
  if (overBudget) return byId("zero-based-budget");

  const lowSurplus = (context.averageMonthlySurplus ?? 0) < context.spentThisMonth * 3 && context.netWorth.bankBalance < context.spentThisMonth * 3;
  if (lowSurplus) return byId("emergency-fund");

  if (context.goals.length === 0) return byId("sip-index-funds");

  if (!context.hasEnoughData) return byId("money-flow-basics");

  return byId("good-vs-bad-debt");
}
