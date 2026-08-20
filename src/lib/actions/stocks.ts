"use server";

import { z } from "zod";
import { searchSymbols } from "@/lib/stock-data";

const searchQuerySchema = z.string().trim().min(1).max(80);

export async function searchStockSymbols(query: string) {
  const parsed = searchQuerySchema.safeParse(query);
  if (!parsed.success) return [];
  return searchSymbols(parsed.data);
}
