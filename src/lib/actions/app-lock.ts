"use server";

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { UNLOCK_COOKIE_NAME } from "@/lib/app-lock-constants";

const pinSchema = z.string().regex(/^\d{4,6}$/, "PIN must be 4-6 digits");

function hashPin(pin: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pin, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPin(pin: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(pin, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

async function setUnlockCookie() {
  const cookieStore = await cookies();
  cookieStore.set(UNLOCK_COOKIE_NAME, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function setAppLockPin(pin: string) {
  const parsed = pinSchema.safeParse(pin);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid PIN" };
  }

  const user = await getCurrentUser();
  await db.user.update({
    where: { id: user.id },
    data: { appLockEnabled: true, appLockPinHash: hashPin(pin) },
  });

  await setUnlockCookie();

  revalidatePath("/profile");
  return { ok: true as const };
}

export async function disableAppLock() {
  const user = await getCurrentUser();
  await db.user.update({ where: { id: user.id }, data: { appLockEnabled: false, appLockPinHash: null } });
  revalidatePath("/profile");
  return { ok: true as const };
}

export async function unlockApp(pin: string) {
  const parsed = pinSchema.safeParse(pin);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid PIN" };
  }

  const user = await getCurrentUser();
  if (!user.appLockPinHash || !verifyPin(parsed.data, user.appLockPinHash)) {
    return { ok: false as const, error: "Incorrect PIN" };
  }

  await setUnlockCookie();

  return { ok: true as const };
}
