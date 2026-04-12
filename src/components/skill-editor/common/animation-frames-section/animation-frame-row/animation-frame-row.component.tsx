import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AUDIO_IDS } from "@/lib/skill-utils";
import type { AnimationDefinition, FrameEvent } from "@/types/actor";
import { Plus, Trash2 } from "lucide-react";

export function AnimationFrameRow({
  frame,
  onChange,
  onDelete,
}: {
  frame: AnimationDefinition;
  onChange: (f: AnimationDefinition) => void;
  onDelete: () => void;
}) {
  const addEvent = (type: FrameEvent["type"]) => {
    let newEvent: FrameEvent;
    if (type === "play_audio") {
      newEvent = { type: "play_audio", audioId: "footstep" };
    } else if (type === "launch_projectile") {
      newEvent = { type: "launch_projectile" };
    } else {
      newEvent = { type: "target_hurt" };
    }
    onChange({
      ...frame,
      frameEvents: [...(frame.frameEvents || []), newEvent],
    });
  };

  return (
    <div className="bg-background rounded p-2 space-y-1">
      <div className="flex items-center gap-2">
        <Label className="text-xs">Col</Label>
        <Input
          type="number"
          className="h-7 w-14 text-xs"
          value={frame.columnIdx}
          onChange={(e) =>
            onChange({ ...frame, columnIdx: parseInt(e.target.value) || 0 })
          }
        />
        <Label className="text-xs">ms</Label>
        <Input
          type="number"
          className="h-7 w-16 text-xs"
          value={frame.frameDurationMs}
          onChange={(e) =>
            onChange({
              ...frame,
              frameDurationMs: parseInt(e.target.value) || 0,
            })
          }
        />
        <div className="flex items-center gap-1 ml-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" className="h-6 text-xs">
                <Plus className="h-3 w-3 mr-1" /> Event
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1" align="end">
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 justify-start text-xs"
                  onClick={() => addEvent("play_audio")}
                >
                  Audio
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 justify-start text-xs"
                  onClick={() => addEvent("launch_projectile")}
                >
                  Launch Projectile
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 justify-start text-xs"
                  onClick={() => addEvent("target_hurt")}
                >
                  Target Hurt
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      {(frame.frameEvents || []).map((ev, ei) => (
        <div
          key={ei}
          className="flex items-center gap-2 pl-4 bg-muted/30 rounded py-1 pr-1"
        >
          <Select
            value={ev.type}
            onValueChange={(v) => {
              const events = [...(frame.frameEvents || [])];
              const newType = v as FrameEvent["type"];
              let newEv: FrameEvent;
              if (newType === "play_audio") {
                newEv = { type: "play_audio", audioId: "footstep" };
              } else if (newType === "launch_projectile") {
                newEv = { type: "launch_projectile" };
              } else {
                newEv = { type: "target_hurt" };
              }
              events[ei] = newEv;
              onChange({ ...frame, frameEvents: events });
            }}
          >
            <SelectTrigger className="h-7 text-[10px] w-28 shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="play_audio">play_audio</SelectItem>
              <SelectItem value="launch_projectile">
                launch_projectile
              </SelectItem>
              <SelectItem value="target_hurt">target_hurt</SelectItem>
            </SelectContent>
          </Select>

          {ev.type === "play_audio" && (
            <Select
              value={ev.audioId}
              onValueChange={(v) => {
                const events = [...(frame.frameEvents || [])];
                events[ei] = {
                  type: "play_audio",
                  audioId: v as Extract<
                    FrameEvent,
                    { type: "play_audio" }
                  >["audioId"],
                };
                onChange({ ...frame, frameEvents: events });
              }}
            >
              <SelectTrigger className="h-7 text-[10px] flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUDIO_IDS.map((id) => (
                  <SelectItem key={id} value={id}>
                    {id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={() =>
              onChange({
                ...frame,
                frameEvents: (frame.frameEvents || []).filter(
                  (_, i) => i !== ei,
                ),
              })
            }
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
