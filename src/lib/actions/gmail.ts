"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { syncGmailForUser } from "@/lib/gmail-sync";

export async function disconnectGmail() {
  const user = await getCurrentUser();
  await db.user.update({
    where: { id: user.id },
    data: { gmailConnected: false, gmailEmail: null, gmailRefreshTokenEnc: null, gmailLastSyncAt: null },
  });
  revalidatePath("/profile");
  return { ok: true as const };
}

export async function syncGmailNow() {
  const user = await getCurrentUser();
  const result = await syncGmailForUser(user.id);

  revalidatePath("/profile");
  if (result.ok) {
    revalidatePath("/home");
    revalidatePath("/transactions");
    revalidatePath("/budgets");
  }
  return result;
}
