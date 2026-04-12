import { AddEffectPopover } from "@/components/skill-editor/common/add-effect-popover/add-effect-popover.component";
import { ConstraintRow } from "@/components/skill-editor/common/constraint-row/constraint-row.component";
import { SortableSideEffectRow } from "@/components/skill-editor/common/sortable-side-effect-row/sortable-side-effect-row.component";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReactionSkillJson } from "@/types/actor";
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
import { Plus } from "lucide-react";

export function ReactionSkillBlock({
  reactionSkill,
  spriteSheet,
  onUploadImage,
  resolveImage,
  onChange,
}: {
  reactionSkill?: ReactionSkillJson;
  spriteSheet: string;
  onUploadImage: (pathKey: string, onPath?: (path: string) => void) => void;
  resolveImage: (path: string) => string;
  onChange: (rs: ReactionSkillJson) => void;
}) {
  const rs: ReactionSkillJson = reactionSkill || {
    id: "",
    name: "",
    reactsTo: "enemies",
    sideEffects: [],
  };
  const update = (patch: Partial<ReactionSkillJson>) =>
    onChange({ ...rs, ...patch });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <div className="bg-background rounded p-3 space-y-2 border border-border">
      <span className="text-xs font-semibold text-foreground">
        Reaction Skill
      </span>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">ID</Label>
          <Input
            className="h-8 text-xs"
            value={rs.id}
            onChange={(e) => update({ id: e.target.value })}
            placeholder="reaction-id"
          />
        </div>
        <div>
          <Label className="text-xs">Name</Label>
          <Input
            className="h-8 text-xs"
            value={rs.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="Reaction Name"
          />
        </div>
        <div>
          <Label className="text-xs">Reacts To</Label>
          <Select
            value={rs.reactsTo}
            onValueChange={(v) =>
              update({ reactsTo: v as ReactionSkillJson["reactsTo"] })
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="enemies">enemies</SelectItem>
              <SelectItem value="allies">allies</SelectItem>
              <SelectItem value="all">all</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Constraints</span>
          <div className="flex gap-1">
            {!(rs.constraints || []).some((c) => c.type === "cast") && (
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs"
                onClick={() =>
                  update({
                    constraints: [
                      ...(rs.constraints || []),
                      { type: "cast", minRange: 0, maxRange: 1 },
                    ],
                  })
                }
              >
                <Plus className="h-3 w-3 mr-1" /> Cast
              </Button>
            )}
            {!(rs.constraints || []).some((c) => c.type === "cooldown") && (
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs"
                onClick={() =>
                  update({
                    constraints: [
                      ...(rs.constraints || []),
                      { type: "cooldown", turns: 1 },
                    ],
                  })
                }
              >
                <Plus className="h-3 w-3 mr-1" /> Cooldown
              </Button>
            )}
            {!(rs.constraints || []).some((c) => c.type === "usagePerTurn") && (
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs"
                onClick={() =>
                  update({
                    constraints: [
                      ...(rs.constraints || []),
                      { type: "usagePerTurn", max: 1 },
                    ],
                  })
                }
              >
                <Plus className="h-3 w-3 mr-1" /> Usage/Turn
              </Button>
            )}
          </div>
        </div>
        {(rs.constraints || []).map((c, ci) => (
          <ConstraintRow
            key={ci}
            constraint={c}
            onChange={(v) => {
              const a = [...(rs.constraints || [])];
              a[ci] = v;
              update({ constraints: a });
            }}
            onDelete={() =>
              update({
                constraints: (rs.constraints || []).filter(
                  (_, i) => i !== ci,
                ),
              })
            }
          />
        ))}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Side Effects</span>
          <AddEffectPopover
            onAdd={(effect) =>
              update({ sideEffects: [...rs.sideEffects, effect] })
            }
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
              update({
                sideEffects: arrayMove(rs.sideEffects, oldIndex, newIndex),
              });
            }
          }}
        >
          <SortableContext
            items={rs.sideEffects.map((_, i) => String(i))}
            strategy={verticalListSortingStrategy}
          >
            {rs.sideEffects.map((se, si) => (
              <SortableSideEffectRow
                key={si}
                id={String(si)}
                effect={se}
                spriteSheet={spriteSheet}
                onUploadImage={onUploadImage}
                resolveImage={resolveImage}
                onChange={(v) => {
                  const a = [...rs.sideEffects];
                  a[si] = v;
                  update({ sideEffects: a });
                }}
                onDelete={() =>
                  update({
                    sideEffects: rs.sideEffects.filter((_, i) => i !== si),
                  })
                }
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
