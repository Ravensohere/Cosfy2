"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Mail, Lock } from "lucide-react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getRedirectResult,
} from "firebase/auth";
import { getFirebaseAuth, firebaseConfigured } from "@/lib/firebase-client";
import { friendlyFirebaseError } from "@/lib/firebase-error";
import { completeFirebaseSignIn } from "@/lib/complete-firebase-signin";
import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { PhoneSignInFlow } from "@/components/auth/PhoneSignInFlow";

type Method = "email" | "phone";
type Mode = "signin" | "signup";

export default function SignInPage() {
  const router = useRouter();
  const [method, setMethod] = useState<Method>("email");
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [checkingRedirect, setCheckingRedirect] = useState(firebaseConfigured);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    getRedirectResult(auth)
      .then(async (result) => {
        if (!result) return;
        const outcome = await completeFirebaseSignIn(result.user);
        if (!outcome.ok) {
          setError(outcome.error);
          return;
        }
        router.push(outcome.needsPersonalization ? "/onboarding/personalize" : "/home");
        router.refresh();
      })
      .catch((err) => setError(friendlyFirebaseError(err, "Google sign-in failed.")))
      .finally(() => setCheckingRedirect(false));
  }, [router]);

  async function handleEmailSubmit() {
    setError(null);
    const auth = getFirebaseAuth();
    if (!auth) {
      setError("Sign-in isn't configured yet.");
      return;
    }
    if (!email || password.length < 6) {
      setError("Enter an email and a password with at least 6 characters.");
      return;
    }

    setIsPending(true);
    try {
      const result =
        mode === "signin"
          ? await signInWithEmailAndPassword(auth, email, password)
          : await createUserWithEmailAndPassword(auth, email, password);
      const outcome = await completeFirebaseSignIn(result.user);
      if (!outcome.ok) {
        setError(outcome.error);
        return;
      }
      router.push(outcome.needsPersonalization ? "/onboarding/personalize" : "/home");
      router.refresh();
    } catch (err) {
      setError(friendlyFirebaseError(err, mode === "signin" ? "Wrong email or password." : "Couldn't create that account."));
    } finally {
      setIsPending(false);
    }
  }

  if (checkingRedirect) {
    return <div className="min-h-dvh flex items-center justify-center text-[13px] text-cosfy-muted">Signing in…</div>;
  }

  return (
    <div className="min-h-dvh flex flex-col px-6 pt-10 pb-8 md:max-w-md md:mx-auto md:pt-16">
      <Link
        href="/profile"
        aria-label="Back"
        className="flex items-center justify-center w-9 h-9 rounded-full bg-cosfy-card border border-cosfy-border mb-6"
      >
        <ChevronLeft size={18} />
      </Link>

      <h1 className="text-[24px] font-extrabold mb-1 text-cosfy-ink">
        {method === "phone" ? "Sign in with phone" : mode === "signin" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="text-[14px] text-cosfy-muted mb-6">
        {method === "phone"
          ? "We'll text you a code to verify."
          : mode === "signin"
            ? "Sign in to your Cosfy account"
            : "Takes less than a minute"}
      </p>

      {!firebaseConfigured ? (
        <p className="text-[13px] text-cosfy-amber mb-4">
          Sign-in isn&apos;t configured yet — add Firebase keys to enable this.
        </p>
      ) : null}

      {method === "email" ? (
        <div className="space-y-4 flex-1">
          <div>
            <p className="text-[12px] font-semibold text-cosfy-ink-soft mb-1.5">Email</p>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cosfy-muted" />
              <Input
                type="email"
                placeholder="priya@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-cosfy-ink-soft mb-1.5">Password</p>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cosfy-muted" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {error ? <p className="text-[13px] text-cosfy-red">{error}</p> : null}

          <PrimaryButton fullWidth type="button" disabled={isPending || !firebaseConfigured} onClick={handleEmailSubmit}>
            {isPending ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
          </PrimaryButton>

          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-cosfy-border" />
            <span className="text-[12px] text-cosfy-muted">or continue with</span>
            <div className="flex-1 h-px bg-cosfy-border" />
          </div>

          <GoogleSignInButton />

          <button
            type="button"
            onClick={() => setMethod("phone")}
            className="w-full text-center text-[13px] font-semibold text-cosfy-lime-deep py-2"
          >
            Continue with phone number
          </button>

          <p className="text-center text-[13px] text-cosfy-muted">
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              className="font-bold text-cosfy-ink"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      ) : (
        <div className="flex-1">
          <PhoneSignInFlow />
          <button
            type="button"
            onClick={() => setMethod("email")}
            className="w-full text-center text-[13px] font-semibold text-cosfy-lime-deep py-4"
          >
            Use email instead
          </button>
        </div>
      )}
    </div>
  );
}
