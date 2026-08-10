"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { PillChip } from "@/components/ui/PillChip";
import { useBillWizard, type BillParticipant } from "@/lib/bill-wizard-store";

type Group = { id: string; name: string; members: { id: string; name: string }[] };

export function ParticipantsForm({ groups }: { groups: Group[] }) {
  const router = useRouter();
  const items = useBillWizard((s) => s.items);
  const setParticipants = useBillWizard((s) => s.setParticipants);
  const setGroupId = useBillWizard((s) => s.setGroupId);

  const [mode, setMode] = useState<"choose" | "existing" | "one-time">("choose");
  const [oneTimeNames, setOneTimeNames] = useState<string[]>([]);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    if (items.length === 0) router.replace("/scan/edit-items");
  }, [items, router]);

  function selectGroup(group: Group) {
    setGroupId(group.id);
    setParticipants(group.members.map((m) => ({ id: m.id, name: m.name, memberId: m.id })));
    router.push("/scan/assign-items");
  }

  function addName() {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setOneTimeNames((prev) => [...prev, trimmed]);
    setNameInput("");
  }

  function continueOneTime() {
    const participants: BillParticipant[] = [
      { id: "you", name: "You" },
      ...oneTimeNames.map((name, i) => ({ id: `p${i}`, name })),
    ];
    setGroupId(null);
    setParticipants(participants);
    router.push("/scan/assign-items");
  }

  if (mode === "choose") {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setMode(groups.length > 0 ? "existing" : "choose")}
          disabled={groups.length === 0}
          className="w-full text-left rounded-card bg-cosfy-card border border-cosfy-border p-4 disabled:opacity-40"
        >
          <p className="font-bold text-[15px] text-cosfy-ink">Choose an existing group</p>
          <p className="text-[13px] text-cosfy-muted mt-0.5">
            {groups.length === 0 ? "No groups yet" : "Pick from your saved groups"}
          </p>
        </button>
        <button
          type="button"
          onClick={() => setMode("one-time")}
          className="w-full text-left rounded-card bg-cosfy-card border border-cosfy-border p-4"
        >
          <p className="font-bold text-[15px] text-cosfy-ink">One-time split</p>
          <p className="text-[13px] text-cosfy-muted mt-0.5">Just for this bill, add names manually</p>
        </button>
      </div>
    );
  }

  if (mode === "existing") {
    return (
      <div className="space-y-3">
        {groups.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => selectGroup(g)}
            className="w-full text-left rounded-card bg-cosfy-card border border-cosfy-border p-4"
          >
            <p className="font-bold text-[14px] text-cosfy-ink">{g.name}</p>
            <p className="text-[12px] text-cosfy-muted">{g.members.length} members</p>
          </button>
        ))}
        <SecondaryButton fullWidth onClick={() => setMode("choose")}>
          Back
        </SecondaryButton>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <PillChip variant="strong">You</PillChip>
        {oneTimeNames.map((name, i) => (
          <PillChip key={`${name}-${i}`} variant="inactive" onClick={() => setOneTimeNames((prev) => prev.filter((_, idx) => idx !== i))}>
            {name} <X size={12} />
          </PillChip>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Add person"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addName();
            }
          }}
        />
        <PrimaryButton type="button" className="h-[52px] px-4" onClick={addName}>
          Add
        </PrimaryButton>
      </div>
      <div className="flex gap-2">
        <SecondaryButton className="flex-1" onClick={() => setMode("choose")}>
          Back
        </SecondaryButton>
        <PrimaryButton className="flex-1" disabled={oneTimeNames.length === 0} onClick={continueOneTime}>
          Continue
        </PrimaryButton>
      </div>
    </div>
  );
}
