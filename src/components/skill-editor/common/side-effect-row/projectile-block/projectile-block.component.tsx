import { AnimationFramesSection } from "@/components/skill-editor/common/animation-frames-section/animation-frames-section.component";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProjectileJsonDefinition } from "@/types/actor";
import { ImagePlus, Plus, Trash2 } from "lucide-react";

export function ProjectileBlock({
  projectile,
  onUploadImage,
  onChange,
  resolveImage,
}: {
  projectile: ProjectileJsonDefinition | undefined;
  onUploadImage: (pathKey: string, onPath?: (path: string) => void) => void;
  onChange: (p: ProjectileJsonDefinition | undefined) => void;
  resolveImage: (path: string) => string;
}) {
  if (!projectile) {
    return (
      <div className="bg-background rounded p-3 border border-dashed border-border flex justify-center">
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            onChange({
              sheetPath: "",
              frameWidth: 32,
              frameHeight: 32,
              frames: [],
              travelDurationMs: 500,
            })
          }
        >
          <Plus className="h-3 w-3 mr-1" /> Add Projectile
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background rounded p-3 space-y-2 border border-border">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">
          Projectile
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive"
          onClick={() => onChange(undefined)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <Label className="text-[10px]">Sheet Path</Label>
          <div className="flex gap-1">
            <Input
              className="h-7 text-xs"
              value={projectile.sheetPath}
              onChange={(e) =>
                onChange({ ...projectile, sheetPath: e.target.value })
              }
            />
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              onClick={() =>
                onUploadImage(projectile.sheetPath, (path) =>
                  onChange({ ...projectile, sheetPath: path }),
                )
              }
            >
              <ImagePlus className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <div>
            <Label className="text-[10px]">W</Label>
            <Input
              type="number"
              className="h-7 text-xs"
              value={projectile.frameWidth}
              onChange={(e) =>
                onChange({
                  ...projectile,
                  frameWidth: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>
          <div>
            <Label className="text-[10px]">H</Label>
            <Input
              type="number"
              className="h-7 text-xs"
              value={projectile.frameHeight}
              onChange={(e) =>
                onChange({
                  ...projectile,
                  frameHeight: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-[10px]">Travel (ms)</Label>
        <Input
          type="number"
          className="h-7 w-20 text-xs"
          value={projectile.travelDurationMs}
          onChange={(e) =>
            onChange({
              ...projectile,
              travelDurationMs: parseInt(e.target.value) || 0,
            })
          }
        />
        <div className="flex items-center gap-1">
          <Checkbox
            checked={!!projectile.loop}
            onCheckedChange={(v) => onChange({ ...projectile, loop: !!v })}
          />
          <Label className="text-[10px]">Loop</Label>
        </div>
      </div>

      <AnimationFramesSection
        animation={projectile.frames}
        loop={!!projectile.loop}
        spriteSheet={resolveImage(projectile.sheetPath)}
        width={projectile.frameWidth}
        height={projectile.frameHeight}
        onChange={(patch) => {
          if ("animation" in patch)
            onChange({ ...projectile, frames: patch.animation });
          if ("loop" in patch) onChange({ ...projectile, loop: patch.loop });
        }}
      />
    </div>
  );
}
