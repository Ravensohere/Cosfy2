import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { COOKIE_NAME, signSessionUid, sessionCookieOptions } from "@/lib/session-cookie";

export async function POST(req: Request) {
  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    return NextResponse.json(
      { error: "Sign-in isn't configured on the server yet." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => null);
  const idToken = body?.idToken;
  if (typeof idToken !== "string" || !idToken) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: "Couldn't verify that sign-in. Try again." }, { status: 401 });
  }

  const current = await getCurrentUser();
  // If this Firebase identity was already linked to a user (e.g. signing in
  // from a different device/browser than where the guest account started),
  // adopt that existing account instead of leaving two disconnected rows
  // sharing one firebaseUid (which the column's @unique constraint would
  // otherwise reject on the update below).
  const existing = await db.user.findUnique({ where: { firebaseUid: decoded.uid } });
  const target = existing ?? current;

  await db.user.update({
    where: { id: target.id },
    data: {
      firebaseUid: decoded.uid,
      email: decoded.email ?? target.email,
      phoneNumber: decoded.phone_number ?? target.phoneNumber,
      displayName: decoded.name ?? target.displayName,
      authProvider: decoded.firebase?.sign_in_provider ?? target.authProvider,
    },
  });

  if (target.id !== current.id) {
    // Rotate the session onto the verified identity's account rather than
    // trusting whatever guest id this browser happened to be carrying.
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, await signSessionUid(target.id), sessionCookieOptions());
  }

  const needsPersonalization = !target.preferredName;
  return NextResponse.json({ ok: true, needsPersonalization });
}
