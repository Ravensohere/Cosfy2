import { Home, Wallet, Target, User } from "lucide-react";

export const CORE_NAV_PREFIXES = [
  "/home",
  "/transactions",
  "/budgets",
  "/goals",
  "/groups",
  "/profile",
  "/chat",
  "/tax-calculator",
  "/sms-import",
  "/import",
  "/credit-cards",
  "/insights",
  "/news",
  "/loans",
  "/insurance",
  "/subscriptions",
  "/gold",
  "/net-worth",
  "/calendar",
];

export const LEFT_NAV_ITEMS = [
  { href: "/home", labelKey: "nav.home" as const, icon: Home },
  { href: "/budgets", labelKey: "nav.expenses" as const, icon: Wallet },
];

export const RIGHT_NAV_ITEMS = [
  { href: "/goals", labelKey: "nav.goals" as const, icon: Target },
  { href: "/profile", labelKey: "nav.profile" as const, icon: User },
];

export function isCoreRoute(pathname: string) {
  return CORE_NAV_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
