import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function resolveIcon(name: string): LucideIcon {
  return (Icons[name as keyof typeof Icons] as LucideIcon) ?? Icons.Circle;
}
