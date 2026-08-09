"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { getFirebaseAuth, firebaseConfigured } from "@/lib/firebase-client";
import { friendlyFirebaseError } from "@/lib/firebase-error";
import { completeFirebaseSignIn } from "@/lib/complete-firebase-signin";
import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { OtpInput } from "@/components/auth/OtpInput";

export function PhoneSignInFlow() {
  const router = useRouter();
  const [step, setStep] = useState<"number" | "otp">("number");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  async function handleSendCode() {
    setError(null);
    const auth = getFirebaseAuth();
    if (!auth) {
      setError("Sign-in isn't configured yet.");
      return;
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Enter a valid 10-digit number.");
      return;
    }

    setIsPending(true);
    try {
      const verifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
      const fullNumber = `+91${digits.slice(-10)}`;
      confirmationRef.current = await signInWithPhoneNumber(auth, fullNumber, verifier);
      setStep("otp");
    } catch (err) {
      setError(friendlyFirebaseError(err, "Couldn't send the code. Check the number and try again."));
    } finally {
      setIsPending(false);
    }
  }

  async function handleVerify() {
    setError(null);
    if (!confirmationRef.current || code.length < 6) {
      setError("Enter the 6-digit code.");
      return;
    }

    setIsPending(true);
    try {
      const result = await confirmationRef.current.confirm(code);
      const outcome = await completeFirebaseSignIn(result.user);
      if (!outcome.ok) {
        setError(outcome.error);
        return;
      }
      router.push("/home");
      router.refresh();
    } catch (err) {
      setError(friendlyFirebaseError(err, "That code didn't match. Try again."));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div id="recaptcha-container" />
      {step === "number" ? (
        <>
          <div>
            <p className="text-[12px] font-semibold text-cosfy-ink-soft mb-1.5">Phone number</p>
            <div className="flex gap-2">
              <span className="flex items-center justify-center px-3 rounded-input border border-cosfy-border bg-cosfy-card text-[14px] font-semibold text-cosfy-ink-soft">
                +91
              </span>
              <Input
                type="tel"
                inputMode="numeric"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          {error ? <p className="text-[12px] text-cosfy-red">{error}</p> : null}
          <PrimaryButton fullWidth type="button" disabled={isPending || !firebaseConfigured} onClick={handleSendCode}>
            {isPending ? "Sending…" : "Send code"}
          </PrimaryButton>
        </>
      ) : (
        <>
          <div>
            <p className="text-[15px] font-extrabold text-cosfy-ink mb-1">Verify your number</p>
            <p className="text-[13px] text-cosfy-muted mb-3">
              Enter the 6-digit code sent to <span className="font-semibold">+91 {phone}</span>
            </p>
            <OtpInput onChange={setCode} />
          </div>
          {error ? <p className="text-[12px] text-cosfy-red">{error}</p> : null}
          <PrimaryButton fullWidth type="button" disabled={isPending} onClick={handleVerify}>
            {isPending ? "Verifying…" : "Verify code"}
          </PrimaryButton>
        </>
      )}
    </div>
  );
}
