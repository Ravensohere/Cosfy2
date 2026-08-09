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
