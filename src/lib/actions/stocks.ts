"use server";

import { searchSymbols } from "@/lib/stock-data";

export async function searchStockSymbols(query: string) {
  return searchSymbols(query);
}
