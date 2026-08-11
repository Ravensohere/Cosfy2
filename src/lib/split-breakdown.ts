export type BreakdownItem = { id: string; name: string; quantity: number; price: number };
export type ItemsBreakdown = { items: BreakdownItem[]; assignments: Record<string, string[]>; taxAndCharges: number };

export function parseItemsBreakdown(json: unknown): ItemsBreakdown | null {
  if (!json || typeof json !== "object") return null;
  const obj = json as Record<string, unknown>;
  if (!Array.isArray(obj.items) || typeof obj.assignments !== "object" || obj.assignments === null) return null;
  return {
    items: obj.items as BreakdownItem[],
    assignments: obj.assignments as Record<string, string[]>,
    taxAndCharges: typeof obj.taxAndCharges === "number" ? obj.taxAndCharges : 0,
  };
}

export type PersonItemShare = { name: string; sharedWith: string[]; amount: number };

export function computePersonItems(
  breakdown: ItemsBreakdown,
  memberId: string,
  memberNamesById: Record<string, string>
): PersonItemShare[] {
  const result: PersonItemShare[] = [];
  for (const item of breakdown.items) {
    const assignees = breakdown.assignments[item.id] ?? [];
    if (!assignees.includes(memberId)) continue;
    const amount = (item.quantity * item.price) / assignees.length;
    const sharedWith = assignees.filter((id) => id !== memberId).map((id) => memberNamesById[id]).filter(Boolean);
    result.push({ name: item.name, sharedWith, amount });
  }
  return result;
}
