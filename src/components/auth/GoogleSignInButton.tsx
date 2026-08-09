"use client";

import { useState } from "react";
import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import { getFirebaseAuth, firebaseConfigured } from "@/lib/firebase-client";
import { friendlyFirebaseError } from "@/lib/firebase-error";
import { SecondaryButton } from "@/components/ui/SecondaryButton";

export function GoogleSignInButton() {
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
      // Redirect, not popup — popups are unreliable on mobile browsers and PWAs.
      // The browser navigates away here; result is picked up by getRedirectResult() on return.
      await signInWithRedirect(auth, new GoogleAuthProvider());
    } catch (err) {
      setError(friendlyFirebaseError(err, "Google sign-in was cancelled or failed."));
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
