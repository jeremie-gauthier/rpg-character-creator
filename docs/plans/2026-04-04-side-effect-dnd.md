# Side Effect Drag-and-Drop Reordering Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add drag-and-drop reordering to both side effect lists in `SkillEditor.tsx` (main skill and reaction skill), independently.

**Architecture:** Add a `SortableSideEffectRow` wrapper component (mirrors `SortableSkillItem` in `Index.tsx`) with a `GripVertical` drag handle. Wrap each side effect list with its own `DndContext` + `SortableContext`. Reorder via `arrayMove` through existing `update()` calls. Two lists stay independent.

**Tech Stack:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` (already installed), React, TypeScript.

---

### Task 1: Add dnd-kit imports and `SortableSideEffectRow` component

**Files:**
- Modify: `src/components/SkillEditor.tsx:1-25`

**Step 1: Add new imports at the top of the file**

After line 21 (`import { ChevronDown, ImagePlus, Plus, Trash2 } from "lucide-react";`), add `GripVertical` to the lucide import:

```ts
import { ChevronDown, GripVertical, ImagePlus, Plus, Trash2 } from "lucide-react";
```

After line 22 (`import { useEffect, useRef, useState } from "react";`), add the dnd-kit imports:

```ts
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
```

**Step 2: Add `SortableSideEffectRow` component**

Insert this new component just above the existing `SideEffectRow` function (which starts at line ~395 — search for `function SideEffectRow`):

```tsx
function SortableSideEffectRow({
  id,
  effect,
  spriteSheet,
  onChange,
  onDelete,
}: {
  id: string;
  effect: SideEffect;
  spriteSheet: string;
  onChange: (e: SideEffect) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-2 -ml-5 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <SideEffectRow effect={effect} spriteSheet={spriteSheet} onChange={onChange} onDelete={onDelete} />
    </div>
  );
}
```

**Step 3: Verify the file compiles**

```bash
bun run build 2>&1 | head -30
```

Expected: no TypeScript errors related to the new code.

**Step 4: Commit**

```bash
rtk git add src/components/SkillEditor.tsx
rtk git commit -m "feat: add SortableSideEffectRow component with drag handle"
```

---

### Task 2: Wire up dnd-kit in `SkillEditor` for main skill side effects

**Files:**
- Modify: `src/components/SkillEditor.tsx` — `SkillEditor` function (starts at line ~135) and the main skill side effects section (lines ~247–256)

**Step 1: Add sensors to `SkillEditor`**

Inside `export function SkillEditor(...)`, just after the existing `const [open, setOpen] = useState(defaultOpen);` line, add:

```ts
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
);
```

**Step 2: Replace the main skill side effects section**

Find this block (around line 247):

```tsx
            {/* Side Effects */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">Side Effects</h4>
                <AddEffectPopover onAdd={(effect) => update({ sideEffects: [...skill.sideEffects, effect] })} />
              </div>
              {skill.sideEffects.map((se, si) => (
                <SideEffectRow key={si} effect={se} spriteSheet={spriteSheet} onChange={(v) => { const a = [...skill.sideEffects]; a[si] = v; update({ sideEffects: a }); }} onDelete={() => update({ sideEffects: skill.sideEffects.filter((_, i) => i !== si) })} />
              ))}
            </section>
```

Replace with:

```tsx
            {/* Side Effects */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">Side Effects</h4>
                <AddEffectPopover onAdd={(effect) => update({ sideEffects: [...skill.sideEffects, effect] })} />
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event: DragEndEvent) => {
                  const { active, over } = event;
                  if (over && active.id !== over.id) {
                    const oldIndex = Number(active.id);
                    const newIndex = Number(over.id);
                    update({ sideEffects: arrayMove(skill.sideEffects, oldIndex, newIndex) });
                  }
                }}
              >
                <SortableContext items={skill.sideEffects.map((_, i) => String(i))} strategy={verticalListSortingStrategy}>
                  {skill.sideEffects.map((se, si) => (
                    <SortableSideEffectRow
                      key={si}
                      id={String(si)}
                      effect={se}
                      spriteSheet={spriteSheet}
                      onChange={(v) => { const a = [...skill.sideEffects]; a[si] = v; update({ sideEffects: a }); }}
                      onDelete={() => update({ sideEffects: skill.sideEffects.filter((_, i) => i !== si) })}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </section>
```

**Step 3: Verify the file compiles**

```bash
bun run build 2>&1 | head -30
```

Expected: no errors.

**Step 4: Commit**

```bash
rtk git add src/components/SkillEditor.tsx
rtk git commit -m "feat: enable drag-and-drop reordering for main skill side effects"
```

---

### Task 3: Wire up dnd-kit in `ReactionSkillBlock` for reaction skill side effects

**Files:**
- Modify: `src/components/SkillEditor.tsx` — `ReactionSkillBlock` function (starts at line ~792) and the reaction side effects section (lines ~842–854)

**Step 1: Add sensors to `ReactionSkillBlock`**

Inside `function ReactionSkillBlock(...)`, just after `const update = (patch: Partial<ReactionSkillJson>) => onChange({ ...rs, ...patch });`, add:

```ts
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
);
```

**Step 2: Replace the reaction side effects section**

Find this block (around line 842):

```tsx
      {/* Reaction side effects */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Side Effects</span>
          <AddEffectPopover
            onAdd={(effect) => update({ sideEffects: [...rs.sideEffects, effect] })}
            triggerClassName="h-6 text-xs"
          />
        </div>
        {rs.sideEffects.map((se, si) => (
          <SideEffectRow key={si} effect={se} spriteSheet={spriteSheet} onChange={(v) => { const a = [...rs.sideEffects]; a[si] = v; update({ sideEffects: a }); }} onDelete={() => update({ sideEffects: rs.sideEffects.filter((_, i) => i !== si) })} />
        ))}
      </div>
```

Replace with:

```tsx
      {/* Reaction side effects */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Side Effects</span>
          <AddEffectPopover
            onAdd={(effect) => update({ sideEffects: [...rs.sideEffects, effect] })}
            triggerClassName="h-6 text-xs"
          />
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event: DragEndEvent) => {
            const { active, over } = event;
            if (over && active.id !== over.id) {
              const oldIndex = Number(active.id);
              const newIndex = Number(over.id);
              update({ sideEffects: arrayMove(rs.sideEffects, oldIndex, newIndex) });
            }
          }}
        >
          <SortableContext items={rs.sideEffects.map((_, i) => String(i))} strategy={verticalListSortingStrategy}>
            {rs.sideEffects.map((se, si) => (
              <SortableSideEffectRow
                key={si}
                id={String(si)}
                effect={se}
                spriteSheet={spriteSheet}
                onChange={(v) => { const a = [...rs.sideEffects]; a[si] = v; update({ sideEffects: a }); }}
                onDelete={() => update({ sideEffects: rs.sideEffects.filter((_, i) => i !== si) })}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
```

**Step 3: Verify the file compiles**

```bash
bun run build 2>&1 | head -30
```

Expected: no errors.

**Step 4: Manual smoke test**

```bash
bun dev
```

Open `http://localhost:8080`, add a skill with 2+ side effects, hover a side effect row — a grip handle should appear on the left. Drag to reorder. Verify the reaction skill side effects list also has independent drag handles.

**Step 5: Commit**

```bash
rtk git add src/components/SkillEditor.tsx
rtk git commit -m "feat: enable drag-and-drop reordering for reaction skill side effects"
```
