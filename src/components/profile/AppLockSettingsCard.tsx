"use client";

import { useState, useTransition } from "react";
import { KeyRound } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { Input, FieldLabel } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { setAppLockPin, disableAppLock } from "@/lib/actions/app-lock";

export function AppLockSettingsCard({ appLockEnabled }: { appLockEnabled: boolean }) {
  const [enabled, setEnabled] = useState(appLockEnabled);
  const [settingPin, setSettingPin] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleToggle(value: boolean) {
    if (value) {
      setSettingPin(true);
      return;
    }
    setEnabled(false);
    setSettingPin(false);
    startTransition(async () => {
      await disableAppLock();
    });
  }

  function savePin() {
    setError(null);
    if (!/^\d{4,6}$/.test(pin)) {
      setError("PIN must be 4-6 digits");
      return;
    }
    if (pin !== confirmPin) {
      setError("PINs don't match");
      return;
    }
    startTransition(async () => {
      const result = await setAppLockPin(pin);
      if (!result.ok) {
        setError(result.error ?? "Couldn't set PIN");
        return;
      }
      setEnabled(true);
      setSettingPin(false);
      setPin("");
      setConfirmPin("");
    });
  }

  return (
    <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4">
      <div className="flex items-center gap-3">
        <IconTile icon={KeyRound} tone="lime" size={44} />
        <div className="flex-1">
          <p className="font-bold text-[14px] text-cosfy-ink">App lock</p>
          <p className="text-[12px] text-cosfy-muted">Require a PIN to open Cosfy</p>
        </div>
        <ToggleSwitch checked={enabled} onChange={handleToggle} />
      </div>

      {settingPin ? (
        <div className="mt-3 space-y-3">
          <div>
            <FieldLabel>{enabled ? "New PIN" : "Set a 4-6 digit PIN"}</FieldLabel>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div>
            <FieldLabel>Confirm PIN</FieldLabel>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          {error ? <p className="text-[13px] text-cosfy-red">{error}</p> : null}
          <div className="flex gap-2">
            <SecondaryButton
              className="flex-1 h-10 text-[13px]"
              onClick={() => {
                setSettingPin(false);
                setPin("");
                setConfirmPin("");
                setError(null);
                if (!enabled) setEnabled(false);
              }}
              disabled={isPending}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton className="flex-1 h-10 text-[13px]" onClick={savePin} disabled={isPending}>
              {isPending ? "Saving…" : "Save PIN"}
            </PrimaryButton>
          </div>
        </div>
      ) : enabled ? (
        <button
          type="button"
          className="text-[12px] font-semibold text-cosfy-lime-deep mt-3"
          onClick={() => setSettingPin(true)}
        >
          Change PIN
        </button>
      ) : null}
    </div>
  );
}
