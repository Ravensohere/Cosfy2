"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { COOKIE_NAME } from "@/middleware";

const notificationsPrefSchema = z.boolean();
const languagePrefSchema = z.enum(["en", "hi"]);

export async function updateNotificationsPref(enabled: boolean) {
  const parsed = notificationsPrefSchema.safeParse(enabled);
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid input" };
  }

  const user = await getCurrentUser();
  await db.user.update({ where: { id: user.id }, data: { notificationsEnabled: parsed.data } });
  revalidatePath("/profile");
}

export async function updateLanguagePref(language: "en" | "hi") {
  const parsed = languagePrefSchema.safeParse(language);
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid input" };
  }

  const user = await getCurrentUser();
  await db.user.update({ where: { id: user.id }, data: { language: parsed.data } });
  revalidatePath("/", "layout");
}

export async function deleteAccount() {
  const user = await getCurrentUser();

  await db.$transaction([
    db.transaction.deleteMany({ where: { userId: user.id } }),
    db.budget.deleteMany({ where: { userId: user.id } }),
    db.goal.deleteMany({ where: { userId: user.id } }),
    db.group.deleteMany({ where: { userId: user.id } }),
    db.creditCard.deleteMany({ where: { userId: user.id } }),
    db.loan.deleteMany({ where: { userId: user.id } }),
    db.insurancePolicy.deleteMany({ where: { userId: user.id } }),
    db.subscription.deleteMany({ where: { userId: user.id } }),
    db.goldHolding.deleteMany({ where: { userId: user.id } }),
    db.user.delete({ where: { id: user.id } }),
  ]);

  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);

  redirect("/");
}
