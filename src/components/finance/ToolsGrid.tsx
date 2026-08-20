"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { GripVertical } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ToolCard } from "@/components/finance/ToolCard";
import { saveToolsOrder } from "@/lib/actions/tools";
import { TOOLS, type Tool } from "@/lib/constants";

function orderTools(tools: Tool[], savedOrder: string[]): Tool[] {
  if (savedOrder.length === 0) return tools;
  const byKey = new Map(tools.map((t) => [t.key, t]));
  const ordered: Tool[] = [];
  for (const key of savedOrder) {
    const tool = byKey.get(key);
    if (tool) {
      ordered.push(tool);
      byKey.delete(key);
    }
  }
  // append any tools not present in the saved order (newly added tools)
  for (const tool of tools) {
    if (byKey.has(tool.key)) ordered.push(tool);
  }
  return ordered;
}

// dnd-kit assigns internal ids (aria-describedby, etc.) that aren't stable
// between the server render and first client render, so it can't be part of
// the initial hydration pass. useSyncExternalStore with a server snapshot of
// `false` gives a hydration-safe "are we mounted on the client yet" flag
// without the extra render + eslint(react-hooks/set-state-in-effect) that a
// `useState` + `useEffect(() => setMounted(true), [])` pair would need.
function subscribeNoop() {
  return () => {};
}
function getClientSnapshot() {
  return true;
}
function getServerSnapshot() {
  return false;
}

function SortableToolCard({ tool, index }: { tool: Tool; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tool.key });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="relative"
    >
      <ToolCard href={tool.href} icon={tool.icon} label={tool.label} description={tool.description} index={index} />
      <button
        type="button"
        aria-label={`Drag to reorder ${tool.label}`}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/25 flex items-center justify-center text-white touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={13} />
      </button>
    </div>
  );
}

export function ToolsGrid({ savedOrder }: { savedOrder: string[] }) {
  const mounted = useSyncExternalStore(subscribeNoop, getClientSnapshot, getServerSnapshot);

  const savedOrderKey = savedOrder.join(",");
  const [ordered, setOrdered] = useState(() => orderTools(TOOLS, savedOrder));
  const [syncedKey, setSyncedKey] = useState(savedOrderKey);
  // Re-derive `ordered` when the server-provided order actually changes
  // (e.g. after a fresh navigation) — adjusting state during render, per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes,
  // avoids a redundant extra render vs. doing this in an effect.
  if (savedOrderKey !== syncedKey) {
    setSyncedKey(savedOrderKey);
    setOrdered(orderTools(TOOLS, savedOrder));
  }

  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = ordered.findIndex((t) => t.key === active.id);
    const newIndex = ordered.findIndex((t) => t.key === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const next = [...ordered];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    setOrdered(next);

    startTransition(() => {
      void saveToolsOrder(next.map((t) => t.key));
    });
  }

  if (!mounted) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {ordered.map((tool, index) => (
          <ToolCard
            key={tool.key}
            href={tool.href}
            icon={tool.icon}
            label={tool.label}
            description={tool.description}
            index={index}
          />
        ))}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ordered.map((t) => t.key)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-3">
          {ordered.map((tool, index) => (
            <SortableToolCard key={tool.key} tool={tool} index={index} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
