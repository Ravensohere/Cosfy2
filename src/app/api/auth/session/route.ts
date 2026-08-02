import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";

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

  const user = await getCurrentUser();
  await db.user.update({
    where: { id: user.id },
    data: {
      firebaseUid: decoded.uid,
      email: decoded.email ?? user.email,
      phoneNumber: decoded.phone_number ?? user.phoneNumber,
      displayName: decoded.name ?? user.displayName,
      authProvider: decoded.firebase?.sign_in_provider ?? user.authProvider,
    },
  });

  return NextResponse.json({ ok: true });
}
