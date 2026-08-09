import type { User } from "firebase/auth";

export async function completeFirebaseSignIn(
  user: User
): Promise<{ ok: true; needsPersonalization: boolean } | { ok: false; error: string }> {
  const idToken = await user.getIdToken();
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, error: data.error ?? "Couldn't complete sign-in." };
  }
  return { ok: true, needsPersonalization: Boolean(data.needsPersonalization) };
}
