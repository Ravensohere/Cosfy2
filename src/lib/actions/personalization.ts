"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

const personalizationSchema = z.object({
  preferredName: z.string().trim().min(1, "Enter a name").max(40),
  age: z.number().int().min(13).max(120).optional(),
});

export type PersonalizationInput = z.infer<typeof personalizationSchema>;

export async function savePersonalization(input: PersonalizationInput) {
  const parsed = personalizationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await getCurrentUser();
  await db.user.update({
    where: { id: user.id },
    data: { preferredName: parsed.data.preferredName, age: parsed.data.age ?? null },
  });

  redirect("/coach");
}

export async function updatePersonalization(input: PersonalizationInput) {
  const parsed = personalizationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await getCurrentUser();
  await db.user.update({
    where: { id: user.id },
    data: { preferredName: parsed.data.preferredName, age: parsed.data.age ?? null },
  });

  revalidatePath("/profile");
  revalidatePath("/home");
  return { ok: true as const };
}
