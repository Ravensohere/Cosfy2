import type { User } from "firebase/auth";

export async function completeFirebaseSignIn(user: User): Promise<{ ok: true } | { ok: false; error: string }> {
  const idToken = await user.getIdToken();
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: data.error ?? "Couldn't complete sign-in." };
  }
  return { ok: true };
}
