import { cache } from "react";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { COOKIE_NAME, verifySessionCookie } from "@/lib/session-cookie";

export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  const uid = await verifySessionCookie(raw);

  if (!uid) {
    throw new Error("Missing or invalid session cookie, middleware should have set it.");
  }

  const user = await db.user.upsert({
    where: { id: uid },
    update: {},
    create: { id: uid },
  });

  return user;
});
