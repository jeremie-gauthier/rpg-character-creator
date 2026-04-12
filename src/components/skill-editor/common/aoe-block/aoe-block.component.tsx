import { AoePreview } from "@/components/AoePreview";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AoeShape } from "@/types/actor";

export function AoeBlock({
  radius,
  minRadius,
  shape,
  shapes,
  onChange,
}: {
  radius: number;
  minRadius: number;
  shape: AoeShape;
  shapes: AoeShape[];
  onChange: (patch: {
    radius?: number;
    minRadius?: number;
    shape?: AoeShape;
  }) => void;
}) {
  return (
    <div className="bg-background rounded p-3 space-y-2">
      <span className="text-xs font-semibold text-foreground">
        Area of Effect
      </span>
      <div className="flex items-start gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <Label className="text-xs w-16 shrink-0">Shape</Label>
            <Select
              value={shape}
              onValueChange={(v) => onChange({ shape: v as AoeShape })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {shapes.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs w-16 shrink-0">Radius</Label>
            <Input
              type="number"
              className="h-8 w-20"
              value={radius}
              onChange={(e) =>
                onChange({ radius: parseInt(e.target.value) || 0 })
              }
              min={0}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs w-16 shrink-0">Min Radius</Label>
            <Input
              type="number"
              className="h-8 w-20"
              value={minRadius}
              onChange={(e) =>
                onChange({ minRadius: parseInt(e.target.value) || 0 })
              }
              min={0}
            />
          </div>
        </div>
        {radius > 0 && (
          <AoePreview radius={radius} minRadius={minRadius} shape={shape} />
        )}
      </div>
    </div>
  );
}
