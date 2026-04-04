# Side Effect Drag-and-Drop Reordering

## Summary

Add drag-and-drop reordering to both side effect lists in `SkillEditor.tsx` (main skill and reaction skill), independently. Uses the already-installed `@dnd-kit` library, mirroring the existing skill-level drag pattern from `Index.tsx`.

## Approach

Option A — inline DndContext per list, no new files.

## Changes

**File:** `src/components/SkillEditor.tsx`

- Add imports: `DndContext`, `closestCenter`, `PointerSensor`, `KeyboardSensor`, `useSensor`, `useSensors`, `DragEndEvent` from `@dnd-kit/core`; `SortableContext`, `useSortable`, `arrayMove`, `verticalListSortingStrategy`, `sortableKeyboardCoordinates` from `@dnd-kit/sortable`; `CSS` from `@dnd-kit/utilities`; `GripVertical` from `lucide-react`.
- Add `SortableSideEffectRow` component: wraps `SideEffectRow` with `useSortable`, renders a `GripVertical` handle on hover (same style as `SortableSkillItem`).
- In `SkillEditor` function: define sensors once (`PointerSensor` + `KeyboardSensor`).
- Wrap both side effect list sections (main skill ~line 253, reaction skill ~line 851) with `DndContext` + `SortableContext`. Use index-as-string as item IDs. `onDragEnd` calls `arrayMove` and routes through the existing `update()` call.

## Constraints

- The two lists are independent; effects cannot be dragged between them.
- No new files.
