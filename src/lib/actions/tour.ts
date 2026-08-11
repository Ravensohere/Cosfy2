"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

export async function completeTour() {
  const user = await getCurrentUser();
  await db.user.update({ where: { id: user.id }, data: { tourCompleted: true } });
}
