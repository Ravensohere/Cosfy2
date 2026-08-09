"use client";

import { useState, useTransition } from "react";
import { X, Trash2 } from "lucide-react";
import { PillChip } from "@/components/ui/PillChip";
import { Input, FieldLabel } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { ShareGroupUpdateButton } from "@/components/finance/ShareGroupUpdateButton";
import { addGroupMember, removeGroupMember, renameGroup, deleteGroup } from "@/lib/actions/groups";

type Member = { id: string; name: string; isCurrentUser: boolean };

export function EditGroupForm({
  groupId,
  initialName,
  members,
  totalSpent,
  memberBalances,
}: {
  groupId: string;
  initialName: string;
  members: Member[];
  totalSpent: number;
  memberBalances: { name: string; balance: number }[];
}) {
  const [name, setName] = useState(initialName);
  const [nameSaved, setNameSaved] = useState(false);
  const [memberInput, setMemberInput] = useState("");
  const [memberError, setMemberError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  function saveName() {
    setNameError(null);
    setNameSaved(false);
    startTransition(async () => {
      const result = await renameGroup(groupId, name);
      if (!result.ok) {
        setNameError(result.error);
        return;
      }
      setNameSaved(true);
    });
  }

  function addMember() {
    const trimmed = memberInput.trim();
    if (!trimmed) return;
    setMemberError(null);
    startTransition(async () => {
      const result = await addGroupMember({ groupId, name: trimmed });
      if (!result.ok) {
        setMemberError(result.error);
        return;
      }
      setMemberInput("");
    });
  }

  function removeMember(memberId: string) {
    setMemberError(null);
    startTransition(async () => {
      const result = await removeGroupMember(groupId, memberId);
      if (!result.ok) {
        setMemberError(result.error);
      }
    });
  }

  function handleDelete() {
    startTransition(() => deleteGroup(groupId));
  }

  return (
    <div className="space-y-5">
      <ShareGroupUpdateButton groupName={name} totalSpent={totalSpent} memberBalances={memberBalances} />

      <div>
        <FieldLabel>Group name</FieldLabel>
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameSaved(false);
            }}
          />
          <PrimaryButton type="button" className="h-[52px] px-4" disabled={isPending || !name.trim()} onClick={saveName}>
            {nameSaved ? "Saved" : "Save"}
          </PrimaryButton>
        </div>
        {nameError ? <p className="text-[13px] text-cosfy-red mt-1.5">{nameError}</p> : null}
      </div>

      <div>
        <FieldLabel>Members</FieldLabel>
        <div className="flex flex-wrap gap-2 mb-2">
          {members.map((m) =>
            m.isCurrentUser ? (
              <PillChip key={m.id} variant="strong">
                {m.name}
              </PillChip>
            ) : (
              <PillChip key={m.id} variant="inactive" onClick={() => removeMember(m.id)} disabled={isPending}>
                {m.name} <X size={12} />
              </PillChip>
            )
          )}
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
          <PrimaryButton type="button" className="h-[52px] px-4" disabled={isPending} onClick={addMember}>
            Add
          </PrimaryButton>
        </div>
        {memberError ? <p className="text-[13px] text-cosfy-red mt-1.5">{memberError}</p> : null}
        <p className="text-[12px] text-cosfy-muted mt-1.5">
          Tap a member chip to remove them. Members with an open balance must settle up first.
        </p>
      </div>

      <div className="rounded-card bg-cosfy-red-soft border border-cosfy-red/20 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1">
            <p className="font-bold text-[14px] text-cosfy-ink">Delete group</p>
            <p className="text-[12px] text-cosfy-muted">Permanently erases this group, its expenses, and settlements</p>
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
              {isPending ? "Deleting…" : "Yes, delete group"}
            </SecondaryButton>
          </div>
        ) : (
          <SecondaryButton fullWidth className="h-10 text-[13px]" onClick={() => setConfirmingDelete(true)}>
            <Trash2 size={14} /> Delete group
          </SecondaryButton>
        )}
      </div>
    </div>
  );
}
