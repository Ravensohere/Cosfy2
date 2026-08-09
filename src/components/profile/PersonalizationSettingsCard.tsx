"use client";

import { useState, useTransition } from "react";
import { UserCircle } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import { Input, FieldLabel } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { updatePersonalization } from "@/lib/actions/personalization";

export function PersonalizationSettingsCard({
  preferredName,
  age,
}: {
  preferredName: string | null;
  age: number | null;
}) {
  const [name, setName] = useState(preferredName ?? "");
  const [ageInput, setAgeInput] = useState(age != null ? String(age) : "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updatePersonalization({
        preferredName: name,
        age: ageInput.trim() ? parseInt(ageInput, 10) : undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
    });
  }

  return (
    <div className="rounded-card bg-cosfy-card border border-cosfy-border p-4">
      <div className="flex items-center gap-3 mb-3">
        <IconTile icon={UserCircle} tone="lime" size={44} />
        <div className="flex-1">
          <p className="font-bold text-[14px] text-cosfy-ink">About you</p>
          <p className="text-[12px] text-cosfy-muted">What Cosfy calls you</p>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <FieldLabel>Preferred name</FieldLabel>
          <Input placeholder="e.g. Sovesh" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <FieldLabel>Age (optional)</FieldLabel>
          <Input type="number" placeholder="e.g. 27" value={ageInput} onChange={(e) => setAgeInput(e.target.value)} />
        </div>
        {error ? <p className="text-[13px] text-cosfy-red">{error}</p> : null}
        <PrimaryButton fullWidth type="button" disabled={isPending || !name.trim()} onClick={save}>
          {isPending ? "Saving…" : saved ? "Saved" : "Save"}
        </PrimaryButton>
      </div>
    </div>
  );
}
