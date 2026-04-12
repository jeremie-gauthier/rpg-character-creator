import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { SkillRequirement } from "@/types/actor";
import { ChevronDown, Plus } from "lucide-react";
import { useState } from "react";
import { RequirementRow } from "./requirement-row/requirement-row.component";

export function SkillRequirements({
  requirements,
  onChange,
}: {
  requirements: SkillRequirement[];
  onChange: (requirements: SkillRequirement[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasSanityReq = requirements.some((r) => r.type === "sanity_form");

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <CollapsibleTrigger className="flex items-center gap-1 hover:opacity-70 transition-opacity">
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${open ? "" : "-rotate-90"}`}
            />
            <h4 className="text-sm font-semibold text-foreground">
              Requirements
            </h4>
          </CollapsibleTrigger>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                onChange([
                  ...requirements,
                  {
                    type: "resource_cost",
                    resource: "ACTION_POINTS",
                    amount: 1,
                  },
                ])
              }
            >
              <Plus className="h-3 w-3 mr-1" /> Resource
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={hasSanityReq}
              onClick={() =>
                onChange([
                  ...requirements,
                  { type: "sanity_form", expectedForm: "PURE" },
                ])
              }
            >
              <Plus className="h-3 w-3 mr-1" /> Sanity
            </Button>
          </div>
        </div>
        <CollapsibleContent className="space-y-2">
          {requirements.map((req, ri) => (
            <RequirementRow
              key={ri}
              req={req}
              onChange={(r) => {
                const a = [...requirements];
                a[ri] = r;
                onChange(a);
              }}
              onDelete={() =>
                onChange(requirements.filter((_, i) => i !== ri))
              }
            />
          ))}
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}
