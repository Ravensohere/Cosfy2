"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { TOOLS } from "@/lib/constants";

const TOOL_KEYS = new Set(TOOLS.map((t) => t.key));

const orderSchema = z
  .array(z.string())
  .refine((keys) => keys.every((k) => TOOL_KEYS.has(k)), "Unknown tool key")
  .refine((keys) => new Set(keys).size === keys.length, "Duplicate tool key");

export async function saveToolsOrder(order: string[]) {
  const parsed = orderSchema.safeParse(order);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid order" };
  }

  const user = await getCurrentUser();
  await db.user.update({ where: { id: user.id }, data: { toolsOrder: parsed.data } });
  return { ok: true as const };
}
