import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { IconTile } from "@/components/ui/IconTile";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-12 px-6">
      {icon ? <IconTile icon={icon} tone="soft" size={56} /> : null}
      <div className="space-y-1">
        <p className="font-bold text-cosfy-ink">{title}</p>
        {description ? <p className="text-[13px] text-cosfy-muted max-w-[260px]">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
