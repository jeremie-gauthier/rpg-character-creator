import { SideEffectRow } from "@/components/skill-editor/common/side-effect-row/side-effect-row.component";
import type { SideEffect } from "@/types/actor";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

export function SortableSideEffectRow({
  id,
  effect,
  spriteSheet,
  onUploadImage,
  resolveImage,
  onChange,
  onDelete,
}: {
  id: string;
  effect: SideEffect;
  spriteSheet: string;
  onUploadImage: (pathKey: string, onPath?: (path: string) => void) => void;
  resolveImage: (path: string) => string;
  onChange: (e: SideEffect) => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-2 -ml-5 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <SideEffectRow
        effect={effect}
        spriteSheet={spriteSheet}
        onUploadImage={onUploadImage}
        resolveImage={resolveImage}
        onChange={onChange}
        onDelete={onDelete}
      />
    </div>
  );
}
