import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SkillRequirement } from "@/types/actor";
import { Trash2 } from "lucide-react";

export function RequirementRow({
  req,
  onChange,
  onDelete,
}: {
  req: SkillRequirement;
  onChange: (r: SkillRequirement) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2 bg-muted rounded-md p-2">
      <span className="text-xs font-medium text-muted-foreground w-24 shrink-0">
        {req.type === "resource_cost" ? "Resource" : "Sanity"}
      </span>
      {req.type === "resource_cost" ? (
        <>
          <Select
            value={req.resource}
            onValueChange={(v) =>
              onChange({
                ...req,
                resource: v as Extract<
                  SkillRequirement,
                  { type: "resource_cost" }
                >["resource"],
              })
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTION_POINTS">AP</SelectItem>
              <SelectItem value="HEALTH_POINTS">HP</SelectItem>
              <SelectItem value="CORRUPTION_POINTS">CP</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            className="h-8 w-20"
            value={req.amount}
            onChange={(e) =>
              onChange({ ...req, amount: parseInt(e.target.value) || 0 })
            }
          />
        </>
      ) : (
        <Select
          value={req.expectedForm}
          onValueChange={(v) =>
            onChange({
              ...req,
              expectedForm: v as Extract<
                SkillRequirement,
                { type: "sanity_form" }
              >["expectedForm"],
            })
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PURE">PURE</SelectItem>
            <SelectItem value="CORRUPTED">CORRUPTED</SelectItem>
          </SelectContent>
        </Select>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={onDelete}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
