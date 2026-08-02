"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { COOKIE_NAME } from "@/middleware";

export async function updateNotificationsPref(enabled: boolean) {
  const user = await getCurrentUser();
  await db.user.update({ where: { id: user.id }, data: { notificationsEnabled: enabled } });
  revalidatePath("/profile");
}

export async function saveOpenAIKey(key: string) {
  const trimmed = key.trim();
  if (!trimmed.startsWith("sk-") || trimmed.length < 20) {
    return { ok: false as const, error: "That doesn't look like a valid OpenAI API key." };
  }

  const user = await getCurrentUser();
  await db.user.update({ where: { id: user.id }, data: { openaiApiKey: trimmed } });
  revalidatePath("/profile");
  return { ok: true as const };
}

export async function clearOpenAIKey() {
  const user = await getCurrentUser();
  await db.user.update({ where: { id: user.id }, data: { openaiApiKey: null } });
  revalidatePath("/profile");
  return { ok: true as const };
}

export async function deleteAccount() {
  const user = await getCurrentUser();

  await db.transaction.deleteMany({ where: { userId: user.id } });
  await db.budget.deleteMany({ where: { userId: user.id } });
  await db.goal.deleteMany({ where: { userId: user.id } });
  await db.group.deleteMany({ where: { userId: user.id } });
  await db.user.delete({ where: { id: user.id } });

  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);

  redirect("/");
}
