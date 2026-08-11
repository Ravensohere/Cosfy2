import { twMerge } from "tailwind-merge";

type ClassValue = string | number | null | boolean | undefined;

export function cn(...values: ClassValue[]): string {
  return twMerge(values.filter(Boolean).join(" "));
}
