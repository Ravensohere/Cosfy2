export const SUPPORTED_LANGUAGES = ["en", "hi"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

const en = {
  "nav.home": "Home",
  "nav.expenses": "Expenses",
  "nav.goals": "Goals",
  "nav.profile": "Profile",

  "home.greeting": "Hi there",
  "home.welcome": "Welcome to Cosfy",
  "home.spending": "This month's spending",
  "home.income": "Income",
  "home.surplus": "Monthly surplus",
  "home.recentActivity": "Recent activity",
  "home.financeNews": "Finance news",
  "home.seeAll": "See all",
  "home.noExpenses": "No expenses yet",
  "home.tapToAdd": "Tap + to add your first.",

  "quickAdd.expense": "Expense",
  "quickAdd.income": "Income",
  "quickAdd.addExpense": "Add expense",
  "quickAdd.addIncome": "Add income",
  "quickAdd.adding": "Adding…",
} as const;

const hi: Record<keyof typeof en, string> = {
  "nav.home": "होम",
  "nav.expenses": "खर्च",
  "nav.goals": "लक्ष्य",
  "nav.profile": "प्रोफ़ाइल",

  "home.greeting": "नमस्ते",
  "home.welcome": "Cosfy में आपका स्वागत है",
  "home.spending": "इस महीने का खर्च",
  "home.income": "आय",
  "home.surplus": "मासिक बचत",
  "home.recentActivity": "हाल की गतिविधि",
  "home.financeNews": "वित्त समाचार",
  "home.seeAll": "सभी देखें",
  "home.noExpenses": "अभी तक कोई खर्च नहीं",
  "home.tapToAdd": "पहला खर्च जोड़ने के लिए + दबाएं।",

  "quickAdd.expense": "खर्च",
  "quickAdd.income": "आय",
  "quickAdd.addExpense": "खर्च जोड़ें",
  "quickAdd.addIncome": "आय जोड़ें",
  "quickAdd.adding": "जोड़ा जा रहा है…",
};

export const translations: Record<Language, Record<keyof typeof en, string>> = { en, hi };
export type TranslationKey = keyof typeof en;

/** Server-safe translation lookup (no hooks) — use in server components. */
export function translate(language: Language, key: TranslationKey): string {
  return translations[language]?.[key] ?? translations.en[key];
}
