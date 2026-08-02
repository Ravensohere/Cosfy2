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
];

export const LEFT_NAV_ITEMS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/budgets", label: "Expenses", icon: Wallet },
];

export const RIGHT_NAV_ITEMS = [
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/profile", label: "Profile", icon: User },
];

export function isCoreRoute(pathname: string) {
  return CORE_NAV_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
