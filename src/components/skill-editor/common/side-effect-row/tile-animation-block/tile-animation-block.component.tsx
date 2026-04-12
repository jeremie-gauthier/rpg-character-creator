import { AnimationFramesSection } from "@/components/skill-editor/common/animation-frames-section/animation-frames-section.component";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TileAnimationJsonDefinition } from "@/types/actor";
import { ImagePlus, Plus, Trash2 } from "lucide-react";

export function TileAnimationBlock({
  animation,
  onUploadImage,
  onChange,
  resolveImage,
}: {
  animation: TileAnimationJsonDefinition | undefined;
  onUploadImage: (pathKey: string, onPath?: (path: string) => void) => void;
  onChange: (a: TileAnimationJsonDefinition | undefined) => void;
  resolveImage: (path: string) => string;
}) {
  if (!animation) {
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
            })
          }
        >
          <Plus className="h-3 w-3 mr-1" /> Add Tile Animation
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background rounded p-3 space-y-2 border border-border">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">
          Tile Animation
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
              value={animation.sheetPath}
              onChange={(e) =>
                onChange({ ...animation, sheetPath: e.target.value })
              }
            />
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              onClick={() =>
                onUploadImage(animation.sheetPath, (path) =>
                  onChange({ ...animation, sheetPath: path }),
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
              value={animation.frameWidth}
              onChange={(e) =>
                onChange({
                  ...animation,
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
              value={animation.frameHeight}
              onChange={(e) =>
                onChange({
                  ...animation,
                  frameHeight: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>
        </div>
      </div>

      <AnimationFramesSection
        animation={animation.frames}
        loop={false}
        spriteSheet={resolveImage(animation.sheetPath)}
        width={animation.frameWidth}
        height={animation.frameHeight}
        onChange={(patch) => {
          if ("animation" in patch)
            onChange({ ...animation, frames: patch.animation });
        }}
      />
    </div>
  );
}
