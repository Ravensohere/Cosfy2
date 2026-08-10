"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect } from "firebase/auth";
import { getFirebaseAuth, firebaseConfigured } from "@/lib/firebase-client";
import { friendlyFirebaseError, getFirebaseErrorCode } from "@/lib/firebase-error";
import { completeFirebaseSignIn } from "@/lib/complete-firebase-signin";
import { SecondaryButton } from "@/components/ui/SecondaryButton";

// Popup avoids the cross-site storage read-back that signInWithRedirect needs —
// browsers that partition third-party storage (modern Chrome included) can silently
// fail to complete a redirect round-trip. Only fall back to redirect when the popup
// itself couldn't open/run (blocked, or the environment doesn't support it at all) —
// getRedirectResult() on the sign-in page picks up that fallback's result on return.
const REDIRECT_FALLBACK_CODES = new Set([
  "auth/popup-blocked",
  "auth/operation-not-supported-in-this-environment",
  "auth/cancelled-popup-request",
]);

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
      const outcome = await completeFirebaseSignIn(result.user);
      if (!outcome.ok) {
        setError(outcome.error);
        return;
      }
      router.push(outcome.needsPersonalization ? "/onboarding/personalize" : "/home");
      router.refresh();
    } catch (err) {
      const code = getFirebaseErrorCode(err);
      if (code && REDIRECT_FALLBACK_CODES.has(code)) {
        try {
          await signInWithRedirect(auth, new GoogleAuthProvider());
          return; // navigating away — sign-in page's getRedirectResult() takes it from here
        } catch (redirectErr) {
          setError(friendlyFirebaseError(redirectErr, "Google sign-in was cancelled or failed."));
        }
      } else {
        setError(friendlyFirebaseError(err, "Google sign-in was cancelled or failed."));
      }
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
