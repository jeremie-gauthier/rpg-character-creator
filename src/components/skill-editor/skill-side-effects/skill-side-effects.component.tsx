import { AddEffectPopover } from "@/components/skill-editor/common/add-effect-popover/add-effect-popover.component";
import { SortableSideEffectRow } from "@/components/skill-editor/common/sortable-side-effect-row/sortable-side-effect-row.component";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { SideEffect } from "@/types/actor";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function SkillSideEffects({
  sideEffects,
  spriteSheet,
  resolveImage,
  onUploadImage,
  onChange,
}: {
  sideEffects: SideEffect[];
  spriteSheet: string;
  resolveImage: (path: string) => string;
  onUploadImage: (pathKey: string, onPath?: (path: string) => void) => void;
  onChange: (sideEffects: SideEffect[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <CollapsibleTrigger className="flex items-center gap-1 hover:opacity-70 transition-opacity">
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${open ? "" : "-rotate-90"}`}
            />
            <h4 className="text-sm font-semibold text-foreground">
              Side Effects
            </h4>
          </CollapsibleTrigger>
          <AddEffectPopover
            onAdd={(effect) => onChange([...sideEffects, effect])}
          />
        </div>
        <CollapsibleContent className="space-y-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event: DragEndEvent) => {
              const { active, over } = event;
              if (over && active.id !== over.id) {
                const oldIndex = Number(active.id);
                const newIndex = Number(over.id);
                onChange(arrayMove(sideEffects, oldIndex, newIndex));
              }
            }}
          >
            <SortableContext
              items={sideEffects.map((_, i) => String(i))}
              strategy={verticalListSortingStrategy}
            >
              {sideEffects.map((se, si) => (
                <SortableSideEffectRow
                  key={si}
                  id={String(si)}
                  effect={se}
                  spriteSheet={spriteSheet}
                  onUploadImage={onUploadImage}
                  resolveImage={resolveImage}
                  onChange={(v) => {
                    const a = [...sideEffects];
                    a[si] = v;
                    onChange(a);
                  }}
                  onDelete={() =>
                    onChange(sideEffects.filter((_, i) => i !== si))
                  }
                />
              ))}
            </SortableContext>
          </DndContext>
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}
