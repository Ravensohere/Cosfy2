"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

export async function saveOnboardingGoals(goals: string[]) {
  const user = await getCurrentUser();
  await db.user.update({ where: { id: user.id }, data: { onboardingGoals: goals } });
}

export async function saveLifeStage(lifeStage: string) {
  const user = await getCurrentUser();
  await db.user.update({ where: { id: user.id }, data: { lifeStage } });
}

export async function completeOnboarding(notificationsEnabled: boolean) {
  const user = await getCurrentUser();
  await db.user.update({
    where: { id: user.id },
    data: { onboardingCompleted: true, notificationsEnabled },
  });
  redirect("/onboarding/personalize");
}
