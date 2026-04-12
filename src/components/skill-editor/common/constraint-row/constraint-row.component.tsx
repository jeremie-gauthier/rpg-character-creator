import { AoePreview } from "@/components/AoePreview";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AOE_SHAPES } from "@/lib/skill-utils";
import type { AoeShape, SkillConstraint } from "@/types/actor";
import { Trash2 } from "lucide-react";

export function ConstraintRow({
  constraint,
  onChange,
  onDelete,
}: {
  constraint: SkillConstraint;
  onChange: (c: SkillConstraint) => void;
  onDelete: () => void;
}) {
  if (constraint.type === "cooldown") {
    return (
      <div className="flex items-center gap-2 bg-muted rounded-md p-2">
        <span className="text-xs font-medium text-muted-foreground w-20 shrink-0">
          cooldown
        </span>
        <Label className="text-xs">Turns</Label>
        <Input
          type="number"
          className="h-8 w-16"
          value={constraint.turns}
          onChange={(e) =>
            onChange({ ...constraint, turns: parseInt(e.target.value) || 1 })
          }
          min={1}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 ml-auto"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  if (constraint.type === "usagePerTurn") {
    return (
      <div className="flex items-center gap-2 bg-muted rounded-md p-2">
        <span className="text-xs font-medium text-muted-foreground w-20 shrink-0">
          usage/turn
        </span>
        <Label className="text-xs">Max</Label>
        <Input
          type="number"
          className="h-8 w-16"
          value={constraint.max}
          onChange={(e) =>
            onChange({ ...constraint, max: parseInt(e.target.value) || 1 })
          }
          min={1}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 ml-auto"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  const shape = constraint.shape || "diamond";
  const radius = constraint.maxRange;
  const minRadius = constraint.minRange;

  return (
    <div className="bg-muted rounded-md p-2 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground w-16 shrink-0">
          cast
        </span>
        <Label className="text-xs">Min</Label>
        <Input
          type="number"
          className="h-8 w-16"
          value={constraint.minRange}
          onChange={(e) =>
            onChange({ ...constraint, minRange: parseInt(e.target.value) || 0 })
          }
          min={0}
        />
        <Label className="text-xs">Max</Label>
        <Input
          type="number"
          className="h-8 w-16"
          value={constraint.maxRange}
          onChange={(e) =>
            onChange({ ...constraint, maxRange: parseInt(e.target.value) || 0 })
          }
          min={0}
        />
        <div className="flex items-center gap-1">
          <Checkbox
            checked={!!constraint.hasLineOfSight}
            onCheckedChange={(v) =>
              onChange({ ...constraint, hasLineOfSight: !!v })
            }
          />
          <Label className="text-xs">LoS</Label>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 ml-auto"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <div className="bg-background rounded p-3 space-y-2">
        <span className="text-xs font-semibold text-foreground">
          Range Shape
        </span>
        <div className="flex items-start gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-xs w-16 shrink-0">Shape</Label>
            <Select
              value={shape}
              onValueChange={(v) =>
                onChange({ ...constraint, shape: v as AoeShape })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AOE_SHAPES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AoePreview radius={radius} minRadius={minRadius} shape={shape} />
        </div>
      </div>
    </div>
  );
}
