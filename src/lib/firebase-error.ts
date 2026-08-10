const KNOWN_MESSAGES: Record<string, string> = {
  "auth/unauthorized-domain": "This domain isn't authorized in Firebase, add it under Authentication > Settings > Authorized domains.",
  "auth/operation-not-allowed": "This sign-in method isn't enabled in Firebase, turn it on under Authentication > Sign-in method.",
  "auth/popup-closed-by-user": "Sign-in popup was closed before finishing.",
  "auth/popup-blocked": "Browser blocked the sign-in popup, allow popups for this site and try again.",
  "auth/cancelled-popup-request": "Sign-in was cancelled.",
  "auth/network-request-failed": "Network error reaching Firebase, check your connection and try again.",
  "auth/invalid-api-key": "Firebase API key looks invalid.",
  "auth/api-key-not-valid": "Firebase API key is restricted or invalid for this domain, check API key restrictions in Google Cloud Console.",
  "auth/email-already-in-use": "An account already exists with that email.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "auth/invalid-phone-number": "That phone number doesn't look valid.",
  "auth/too-many-requests": "Too many attempts, wait a bit and try again.",
  "auth/billing-not-enabled": "Phone sign-in needs the Blaze (pay-as-you-go) plan enabled on this Firebase project.",
  "auth/quota-exceeded": "Phone sign-in quota exceeded for this project.",
  "auth/captcha-check-failed": "reCAPTCHA check failed, reload and try again.",
};

export function getFirebaseErrorCode(err: unknown): string | null {
  return typeof err === "object" && err !== null && "code" in err ? String((err as { code: unknown }).code) : null;
}

export function friendlyFirebaseError(err: unknown, fallback: string): string {
  const code = getFirebaseErrorCode(err);
  if (code && KNOWN_MESSAGES[code]) return KNOWN_MESSAGES[code];
  if (code) return `${fallback} (${code})`;
  return fallback;
}
