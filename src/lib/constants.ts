export const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Home",
  "Other",
  "Income",
] as const;

export type CategoryValue = (typeof CATEGORIES)[number];

export const PAYMENT_MODES = ["UPI", "Cash", "Card"] as const;
export type PaymentModeValue = (typeof PAYMENT_MODES)[number];

export const GROUP_TYPES = ["Trip", "Flatmates", "Couple", "Office", "Friends", "Family"] as const;
export const SPLIT_TYPES = ["Equal", "ByItem", "Exact", "Percent"] as const;
export const BUDGET_TYPES = ["Monthly", "Category", "Weekly"] as const;
export const GOAL_TYPES = [
  "Emergency fund",
  "Gadget",
  "Travel",
  "Vehicle",
  "Education",
  "Wedding",
  "Other",
] as const;

import {
  Calculator,
  MessageSquareText,
  CreditCard,
  Sparkles,
  Newspaper,
  Landmark,
  ShieldCheck,
  Repeat,
  Coins,
  TrendingUp,
  CalendarDays,
  Tag,
  PieChart,
  LineChart,
  type LucideIcon,
} from "lucide-react";

export type Tool = {
  key: string;
  href: string;
  icon: LucideIcon;
  label: string;
  description: string;
};

// Order here is the default/fallback order — the tools page lets a user
// drag-reorder these per-account (see User.toolsOrder), so this list is not
// itself a priority ranking, just a stable base to append new tools to.
export const TOOLS: Tool[] = [
  { key: "net-worth", href: "/net-worth", icon: TrendingUp, label: "Net worth", description: "Assets, cash & debts in one number" },
  { key: "loans", href: "/loans", icon: Landmark, label: "Loans & EMIs", description: "Track EMI due dates automatically" },
  { key: "insurance", href: "/insurance", icon: ShieldCheck, label: "Insurance", description: "Policies, premiums & renewal alerts" },
  { key: "subscriptions", href: "/subscriptions", icon: Repeat, label: "Subscriptions", description: "Catch recurring charges before renewal" },
  { key: "coupons", href: "/coupons", icon: Tag, label: "Coupons", description: "Never miss a saved discount" },
  { key: "credit-cards", href: "/credit-cards", icon: CreditCard, label: "Cards & spending", description: "Spend totals per card, at a glance" },
  { key: "import", href: "/import", icon: MessageSquareText, label: "Import expenses", description: "Bulk-import from SMS or statements" },
  { key: "insights", href: "/insights", icon: Sparkles, label: "AI spending insights", description: "Kosh finds patterns you'd miss" },
  { key: "calendar", href: "/calendar", icon: CalendarDays, label: "Cash-flow calendar", description: "See upcoming bills before they hit" },
  { key: "gold", href: "/gold", icon: Coins, label: "Gold", description: "Physical, digital & SGB holdings" },
  { key: "tax-calculator", href: "/tax-calculator", icon: Calculator, label: "Salary tax calculator", description: "Estimate take-home in seconds" },
  { key: "stocks", href: "/stocks", icon: LineChart, label: "Research a stock", description: "Fundamentals & news, one search" },
  { key: "summary", href: "/summary", icon: PieChart, label: "Full summary", description: "Every category, one screen" },
  { key: "news", href: "/news", icon: Newspaper, label: "Finance news", description: "Markets that affect your money" },
];

export const ONBOARDING_GOALS = [
  { value: "track-spending", label: "Track spending", description: "See where money actually goes" },
  { value: "save", label: "Save for something", description: "Trip, gadget, emergency fund" },
  { value: "split-bills", label: "Split bills fairly", description: "No more calculator math" },
  { value: "clear-debt", label: "Clear debt", description: "Keep EMIs and dues under control" },
] as const;

export const LIFE_STAGES = [
  { value: "student", label: "Student", description: "College or PG" },
  { value: "first-job", label: "First job", description: "0–3 years working" },
  { value: "couple", label: "Couple", description: "Planning together" },
  { value: "family", label: "Family", description: "Kids or parents" },
  { value: "freelancer", label: "Freelancer", description: "Self-employed" },
  { value: "business-owner", label: "Business owner", description: "Run a small business" },
] as const;

export const CATEGORY_ICON: Record<CategoryValue, string> = {
  Food: "Utensils",
  Transport: "Car",
  Shopping: "ShoppingBag",
  Entertainment: "Film",
  Health: "HeartPulse",
  Home: "Home",
  Other: "Receipt",
  Income: "TrendingUp",
};

export const INSURANCE_TYPES = ["Life", "Health", "Vehicle", "Other"] as const;
export const INSURANCE_FREQUENCIES = ["Monthly", "Quarterly", "HalfYearly", "Yearly"] as const;

export const SUBSCRIPTION_CYCLES = ["Weekly", "Monthly", "Yearly"] as const;

export const GOLD_TYPES = ["Physical", "Digital", "SGB"] as const;

export const BUDGET_PRESETS = [
  { value: "diwali", label: "Diwali season", months: 1 },
  { value: "wedding", label: "Wedding season", months: 2 },
  { value: "exam", label: "Exam season", months: 3 },
  { value: "custom", label: "Custom range", months: 1 },
] as const;
