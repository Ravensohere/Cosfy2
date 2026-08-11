export type TourStep = {
  id: string;
  title: string;
  body: string;
  radius?: number;
};

export const TOUR_STEPS: TourStep[] = [
  {
    id: "home-greeting",
    title: "Meet your mascot",
    body: "This little guy changes mood with your finances, happy when you're saving, concerned when you're overspending.",
  },
  {
    id: "home-month-picker",
    title: "Pick any month",
    body: "Tap here to jump straight to any month, or use the arrows to step through one at a time.",
    radius: 999,
  },
  {
    id: "home-hero-spending",
    title: "This month's spending",
    body: "Your total spend for the selected month, front and centre.",
  },
  {
    id: "home-stats",
    title: "Income and surplus",
    body: "See what came in and what's left over, side by side.",
  },
  {
    id: "home-quick-actions",
    title: "Split bills and groups",
    body: "Scan a bill to split it with friends, or manage shared expense groups here.",
  },
  {
    id: "home-streak",
    title: "Streaks",
    body: "Keep logging expenses, or go a stretch without spending, and Cosfy tracks the streak.",
  },
  {
    id: "home-net-worth",
    title: "Net worth",
    body: "Bank balance, investments, and EPF, weighed against what you owe.",
  },
  {
    id: "home-recent-activity",
    title: "Recent activity",
    body: "Your latest transactions show up here. Tap \"See all\" for the full list.",
  },
  {
    id: "home-news",
    title: "Finance news",
    body: "Market and finance headlines relevant to you, refreshed regularly.",
  },
  {
    id: "nav-home",
    title: "Home",
    body: "Your dashboard, always one tap away.",
    radius: 999,
  },
  {
    id: "nav-budgets",
    title: "Expenses",
    body: "Browse and manage your budgets by category.",
    radius: 999,
  },
  {
    id: "nav-add",
    title: "Add expense",
    body: "The fastest way in: log an expense or income in a couple of taps.",
    radius: 999,
  },
  {
    id: "nav-goals",
    title: "Goals",
    body: "Set savings targets and track progress toward them.",
    radius: 999,
  },
  {
    id: "nav-profile",
    title: "Profile",
    body: "Your account, cards, loans, insurance, and settings live here.",
    radius: 999,
  },
  {
    id: "floating-ai",
    title: "Ask Cosfy anything",
    body: "Tap here anytime for your AI Coach or a quick lesson from Money School.",
    radius: 999,
  },
];
