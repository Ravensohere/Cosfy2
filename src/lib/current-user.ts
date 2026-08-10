import { cache } from "react";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { COOKIE_NAME } from "@/middleware";

export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const uid = cookieStore.get(COOKIE_NAME)?.value;

  if (!uid) {
    throw new Error("Missing guest session cookie, middleware should have set it.");
  }

  const user = await db.user.upsert({
    where: { id: uid },
    update: {},
    create: { id: uid },
  });

  return user;
});
