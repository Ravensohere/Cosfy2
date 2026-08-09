"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirebaseAuth, firebaseConfigured } from "@/lib/firebase-client";
import { friendlyFirebaseError } from "@/lib/firebase-error";
import { SecondaryButton } from "@/components/ui/SecondaryButton";

export function GoogleSignInButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    setError(null);
    const auth = getFirebaseAuth();
    if (!auth) {
      setError("Sign-in isn't configured yet.");
      return;
    }

    setIsPending(true);
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const idToken = await result.user.getIdToken();
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Couldn't sign in with Google.");
        return;
      }
      router.push("/home");
      router.refresh();
    } catch (err) {
      setError(friendlyFirebaseError(err, "Google sign-in was cancelled or failed."));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div>
      <SecondaryButton fullWidth type="button" onClick={handleClick} disabled={isPending || !firebaseConfigured}>
        {isPending ? "Signing in…" : "Continue with Google"}
      </SecondaryButton>
      {error ? <p className="text-[12px] text-cosfy-red mt-2">{error}</p> : null}
    </div>
  );
}
