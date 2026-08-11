export type TourStep = {
  id: string;
  path: string;
  title: string;
  body: string;
  radius?: number;
};

export const TOUR_STEPS: TourStep[] = [
  {
    id: "home-greeting",
    path: "/home",
    title: "Meet your mascot",
    body: "This little guy changes mood with your finances, happy when you're saving, concerned when you're overspending.",
  },
  {
    id: "home-month-picker",
    path: "/home",
    title: "Pick any month",
    body: "Tap here to jump straight to any month, or use the arrows to step through one at a time.",
    radius: 999,
  },
  {
    id: "home-hero-spending",
    path: "/home",
    title: "This month's spending",
    body: "Your total spend for the selected month, front and centre.",
  },
  {
    id: "home-stats",
    path: "/home",
    title: "Income and surplus",
    body: "See what came in and what's left over, side by side.",
  },
  {
    id: "home-quick-actions",
    path: "/home",
    title: "Split bills, groups, and coupons",
    body: "Scan a bill to split it with friends, manage shared expense groups, or save coupons before you forget to use them.",
  },
  {
    id: "home-streak",
    path: "/home",
    title: "Streaks",
    body: "Keep logging expenses, or go a stretch without spending, and Cosfy tracks the streak.",
  },
  {
    id: "home-net-worth",
    path: "/home",
    title: "Net worth",
    body: "Bank balance, investments, and EPF, weighed against what you owe.",
  },
  {
    id: "home-recent-activity",
    path: "/home",
    title: "Recent activity",
    body: "Your latest transactions show up here. Tap \"See all\" for the full list.",
  },
  {
    id: "home-news",
    path: "/home",
    title: "Finance news",
    body: "Market and finance headlines relevant to you, refreshed regularly.",
  },
  {
    id: "nav-home",
    path: "/home",
    title: "Home",
    body: "Your dashboard, always one tap away.",
    radius: 999,
  },
  {
    id: "nav-budgets",
    path: "/home",
    title: "Expenses",
    body: "Browse and manage your budgets by category.",
    radius: 999,
  },
  {
    id: "nav-add",
    path: "/home",
    title: "Add expense",
    body: "The fastest way in: log an expense or income in a couple of taps.",
    radius: 999,
  },
  {
    id: "nav-goals",
    path: "/home",
    title: "Goals",
    body: "Set savings targets and track progress toward them.",
    radius: 999,
  },
  {
    id: "nav-profile",
    path: "/home",
    title: "Profile",
    body: "Your account, cards, loans, insurance, and settings live here.",
    radius: 999,
  },
  {
    id: "floating-ai",
    path: "/home",
    title: "Ask Cosfy anything",
    body: "Tap here anytime for your AI Coach or a quick lesson from Money School.",
    radius: 999,
  },
  {
    id: "coach-chat",
    path: "/coach",
    title: "Your AI coach",
    body: "Ask anything about your spending, budgets, or goals. Cosfy answers using your real numbers, not generic advice.",
  },
  {
    id: "learn-featured",
    path: "/learn",
    title: "Money School",
    body: "Short lessons on saving, credit, debt, and tax, picked based on your actual situation.",
  },
  {
    id: "transactions-filter",
    path: "/transactions",
    title: "Full history",
    body: "Every transaction you've logged, filterable by month.",
  },
  {
    id: "budgets-new",
    path: "/budgets",
    title: "Set budgets",
    body: "Monthly, weekly, or per-category. Cosfy tracks spend against each and warns you before you go over.",
  },
  {
    id: "goals-new",
    path: "/goals",
    title: "Save toward something",
    body: "Set a target, track contributions, and optionally round up spare change into it automatically.",
  },
  {
    id: "goals-tools",
    path: "/goals",
    title: "Everything else",
    body: "Net worth, loans, insurance, subscriptions, gold, tax calculator, credit card due dates, and more, all one tap away.",
  },
  {
    id: "groups-new",
    path: "/groups",
    title: "Split bills with friends",
    body: "Create a group, add expenses, and Cosfy works out who owes what.",
  },
  {
    id: "insights-links",
    path: "/insights",
    title: "AI-powered insights",
    body: "Your financial health score and monthly report, generated from your real spending.",
  },
  {
    id: "profile-header",
    path: "/profile",
    title: "Your account",
    body: "Sign in to sync across devices, and manage every setting from here. That's the full tour, enjoy Cosfy.",
  },
];
