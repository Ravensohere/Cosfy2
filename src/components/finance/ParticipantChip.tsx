import { PillChip } from "@/components/ui/PillChip";

export function ParticipantChip({
  name,
  selected,
  onClick,
}: {
  name: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <PillChip variant={selected ? "active" : "inactive"} onClick={onClick} type="button">
      {name}
    </PillChip>
  );
}
