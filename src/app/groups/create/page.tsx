"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageContainer";
import { PillChip } from "@/components/ui/PillChip";
import { Input, FieldLabel } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GROUP_TYPES, SPLIT_TYPES } from "@/lib/constants";
import { createGroup } from "@/lib/actions/groups";

export default function CreateGroupPage() {
  const [name, setName] = useState("");
  const [type, setType] = useState<(typeof GROUP_TYPES)[number]>("Friends");
  const [defaultSplit, setDefaultSplit] = useState<(typeof SPLIT_TYPES)[number]>("Equal");
  const [memberInput, setMemberInput] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function addMember() {
    const trimmed = memberInput.trim();
    if (!trimmed) return;
    setMembers((prev) => [...prev, trimmed]);
    setMemberInput("");
  }

  function removeMember(index: number) {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  }

  function handleCreate() {
    setError(null);
    if (!name.trim()) {
      setError("Name your group");
      return;
    }
    startTransition(async () => {
      const result = await createGroup({ name: name.trim(), type, defaultSplit, memberNames: members });
      if (result && !result.ok) {
        setError(result.error);
        return;
      }
      toast.success("Group created");
    });
  }

  return (
    <PageContainer title="Create group" backHref="/groups">
      <div className="space-y-5">
        <div>
          <FieldLabel>Group name</FieldLabel>
          <Input placeholder="e.g. Goa trip" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <FieldLabel>Group type</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {GROUP_TYPES.map((t) => (
              <PillChip key={t} variant={type === t ? "active" : "inactive"} onClick={() => setType(t)}>
                {t}
              </PillChip>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Members</FieldLabel>
          <div className="flex flex-wrap gap-2 mb-2">
            <PillChip variant="strong">You</PillChip>
            {members.map((m, i) => (
              <PillChip key={`${m}-${i}`} variant="inactive" onClick={() => removeMember(i)}>
                {m} <X size={12} />
              </PillChip>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add member name"
              value={memberInput}
              onChange={(e) => setMemberInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addMember();
                }
              }}
            />
            <PrimaryButton type="button" className="h-[52px] px-4" onClick={addMember}>
              Add
            </PrimaryButton>
          </div>
        </div>

        <div>
          <FieldLabel>Default split</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {SPLIT_TYPES.map((s) => (
              <PillChip key={s} variant={defaultSplit === s ? "active" : "inactive"} onClick={() => setDefaultSplit(s)}>
                {s}
              </PillChip>
            ))}
          </div>
        </div>

        {error ? <p className="text-[13px] text-cosfy-red">{error}</p> : null}

        <PrimaryButton fullWidth disabled={isPending} onClick={handleCreate}>
          {isPending ? "Creating…" : "Create group"}
        </PrimaryButton>
      </div>
    </PageContainer>
  );
}
