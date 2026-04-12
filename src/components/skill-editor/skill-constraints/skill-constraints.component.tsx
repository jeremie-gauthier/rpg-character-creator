import { ConstraintRow } from "@/components/skill-editor/common/constraint-row/constraint-row.component";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { SkillConstraint } from "@/types/actor";
import { ChevronDown, Plus } from "lucide-react";
import { useState } from "react";

export function SkillConstraints({
  constraints,
  onChange,
}: {
  constraints: SkillConstraint[];
  onChange: (constraints: SkillConstraint[]) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <CollapsibleTrigger className="flex items-center gap-1 hover:opacity-70 transition-opacity">
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${open ? "" : "-rotate-90"}`}
            />
            <h4 className="text-sm font-semibold text-foreground">
              Constraints
            </h4>
          </CollapsibleTrigger>
          <div className="flex gap-1">
            {!constraints.some((c) => c.type === "cast") && (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onChange([
                    ...constraints,
                    { type: "cast", minRange: 0, maxRange: 1 },
                  ])
                }
              >
                <Plus className="h-3 w-3 mr-1" /> Cast
              </Button>
            )}
            {!constraints.some((c) => c.type === "cooldown") && (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onChange([...constraints, { type: "cooldown", turns: 1 }])
                }
              >
                <Plus className="h-3 w-3 mr-1" /> Cooldown
              </Button>
            )}
            {!constraints.some((c) => c.type === "usagePerTurn") && (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onChange([
                    ...constraints,
                    { type: "usagePerTurn", max: 1 },
                  ])
                }
              >
                <Plus className="h-3 w-3 mr-1" /> Usage/Turn
              </Button>
            )}
          </div>
        </div>
        <CollapsibleContent className="space-y-2">
          {constraints.map((c, ci) => (
            <ConstraintRow
              key={ci}
              constraint={c}
              onChange={(v) => {
                const a = [...constraints];
                a[ci] = v;
                onChange(a);
              }}
              onDelete={() =>
                onChange(constraints.filter((_, i) => i !== ci))
              }
            />
          ))}
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}
