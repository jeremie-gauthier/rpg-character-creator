import { AnimationPreview } from "@/components/AnimationPreview";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { AnimationDefinition } from "@/types/actor";
import { Plus } from "lucide-react";
import { AnimationFrameRow } from "./animation-frame-row/animation-frame-row.component";
import { PresetAnimationPopover } from "./preset-animation-popover/preset-animation-popover.component";

export function AnimationFramesSection({
  animation,
  loop,
  spriteSheet,
  width,
  height,
  onChange,
}: {
  animation: AnimationDefinition[];
  loop: boolean;
  spriteSheet: string | undefined;
  width?: number;
  height?: number;
  onChange: (
    patch: { animation: AnimationDefinition[] } | { loop: boolean },
  ) => void;
}) {
  return (
    <div className="pl-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">
            Animation Frames
          </span>
          <div className="flex items-center gap-1">
            <Checkbox
              checked={loop}
              onCheckedChange={(v) => onChange({ loop: !!v })}
            />
            <Label className="text-xs">Loop</Label>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <PresetAnimationPopover
            onSelect={(frames) => onChange({ animation: frames })}
          />
          <Button
            size="sm"
            variant="outline"
            className="h-6 text-xs"
            onClick={() =>
              onChange({
                animation: [
                  ...animation,
                  { columnIdx: 0, frameDurationMs: 150 },
                ],
              })
            }
          >
            <Plus className="h-3 w-3 mr-1" /> Frame
          </Button>
        </div>
      </div>

      {animation.map((frame, fi) => (
        <AnimationFrameRow
          key={fi}
          frame={frame}
          onChange={(f) => {
            const anim = [...animation];
            anim[fi] = f;
            onChange({ animation: anim });
          }}
          onDelete={() =>
            onChange({ animation: animation.filter((_, i) => i !== fi) })
          }
        />
      ))}

      {animation.length > 0 && (
        <AnimationPreview
          spriteSheetSrc={spriteSheet || ""}
          frames={animation}
          loop={loop}
          width={width}
          height={height}
        />
      )}
    </div>
  );
}
