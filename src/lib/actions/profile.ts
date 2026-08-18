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

export async function updateLanguagePref(language: "en" | "hi") {
  const user = await getCurrentUser();
  await db.user.update({ where: { id: user.id }, data: { language } });
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
