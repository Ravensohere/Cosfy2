"use client";

import { useState, useTransition } from "react";
import { Bell, Trash2 } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { RoundUpSettingsCard } from "@/components/profile/RoundUpSettingsCard";
import { AppLockSettingsCard } from "@/components/profile/AppLockSettingsCard";
import { GmailImportCard } from "@/components/profile/GmailImportCard";
import { LanguageSettingsCard } from "@/components/profile/LanguageSettingsCard";
import { PersonalizationSettingsCard } from "@/components/profile/PersonalizationSettingsCard";
import { updateNotificationsPref, deleteAccount } from "@/lib/actions/profile";

export function ProfileSettings({
  notificationsEnabled,
  roundUpEnabled,
  roundUpIncrement,
  roundUpGoalId,
  goals,
  appLockEnabled,
  preferredName,
  age,
  gmailConnected,
  gmailEmail,
}: {
  notificationsEnabled: boolean;
  roundUpEnabled: boolean;
  roundUpIncrement: number;
  roundUpGoalId: string | null;
  goals: { id: string; name: string }[];
  appLockEnabled: boolean;
  preferredName: string | null;
  age: number | null;
  gmailConnected: boolean;
  gmailEmail: string | null;
}) {
  const [notifications, setNotifications] = useState(notificationsEnabled);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleToggle(value: boolean) {
    setNotifications(value);
    startTransition(() => updateNotificationsPref(value));
  }

  function handleDelete() {
    startTransition(() => deleteAccount());
  }

  return (
    <div className="space-y-3">
      <PersonalizationSettingsCard preferredName={preferredName} age={age} />

      <div className="flex items-center gap-3 rounded-card bg-cosfy-card border border-cosfy-border p-4">
        <IconTile icon={Bell} tone="lime" size={44} />
        <div className="flex-1">
          <p className="font-bold text-[14px] text-cosfy-ink">Notifications</p>
          <p className="text-[12px] text-cosfy-muted">Budget alerts and reminders</p>
        </div>
        <ToggleSwitch checked={notifications} onChange={handleToggle} />
      </div>

      <RoundUpSettingsCard
        roundUpEnabled={roundUpEnabled}
        roundUpIncrement={roundUpIncrement}
        roundUpGoalId={roundUpGoalId}
        goals={goals}
      />

      <AppLockSettingsCard appLockEnabled={appLockEnabled} />

      <GmailImportCard gmailConnected={gmailConnected} gmailEmail={gmailEmail} />

      <LanguageSettingsCard />

      <div className="rounded-card bg-cosfy-red-soft border border-cosfy-red/20 p-4">
        <div className="flex items-center gap-3 mb-3">
          <IconTile icon={Trash2} tone="soft" size={44} />
          <div className="flex-1">
            <p className="font-bold text-[14px] text-cosfy-ink">Delete account</p>
            <p className="text-[12px] text-cosfy-muted">Permanently erases all your Cosfy data</p>
          </div>
        </div>
        {confirmingDelete ? (
          <div className="flex gap-2">
            <SecondaryButton className="flex-1 h-10 text-[13px]" onClick={() => setConfirmingDelete(false)} disabled={isPending}>
              Cancel
            </SecondaryButton>
            <SecondaryButton
              className="flex-1 h-10 text-[13px] border-cosfy-red text-cosfy-red"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting…" : "Yes, delete everything"}
            </SecondaryButton>
          </div>
        ) : (
          <SecondaryButton fullWidth className="h-10 text-[13px]" onClick={() => setConfirmingDelete(true)}>
            Delete account
          </SecondaryButton>
        )}
      </div>
    </div>
  );
}
