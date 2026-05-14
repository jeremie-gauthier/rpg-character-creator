import { useState } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ANIMATION_TAGS } from "@/data/predefined-animations";
import { AUDIO_IDS, FRAME_EVENT_TYPES } from "@/lib/skill-utils";
import type { FrameEvent } from "@/types/actor";
import { Plus, Trash2 } from "lucide-react";

const NONE_VALUE = "__none__";

export function AnimationTagSection({
  animationTag,
  frameEvents,
  onChange,
}: {
  animationTag: string | undefined;
  frameEvents: Record<string, readonly FrameEvent[]> | undefined;
  onChange: (patch: {
    animationTag?: string;
    frameEvents?: Record<string, readonly FrameEvent[]>;
  }) => void;
}) {
  const events = frameEvents ?? {};

  const addFrameEvent = (frameIndex: string, event: FrameEvent) => {
    const current = events[frameIndex] ?? [];
    onChange({
      frameEvents: { ...events, [frameIndex]: [...current, event] },
    });
  };

  const removeFrameEvent = (frameIndex: string, eventIdx: number) => {
    const current = [...(events[frameIndex] ?? [])];
    current.splice(eventIdx, 1);
    const updated = { ...events };
    if (current.length === 0) {
      delete updated[frameIndex];
    } else {
      updated[frameIndex] = current;
    }
    onChange({ frameEvents: updated });
  };

  const updateFrameEvent = (
    frameIndex: string,
    eventIdx: number,
    event: FrameEvent,
  ) => {
    const current = [...(events[frameIndex] ?? [])];
    current[eventIdx] = event;
    onChange({ frameEvents: { ...events, [frameIndex]: current } });
  };

  return (
    <div className="pl-4 space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground">Animation Tag</Label>
        <Select
          value={animationTag || NONE_VALUE}
          onValueChange={(v) =>
            onChange({ animationTag: v === NONE_VALUE ? undefined : v })
          }
        >
          <SelectTrigger className="h-7 text-xs w-40">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_VALUE}>None</SelectItem>
            {ANIMATION_TAGS.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {animationTag && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Frame Events</span>
            <FrameEventAdder
              onAdd={(frameIndex, event) => addFrameEvent(frameIndex, event)}
            />
          </div>

          {Object.entries(events).sort(([a], [b]) => Number(a) - Number(b)).flatMap(([frameIndex, evs]) =>
            evs.map((ev, ei) => (
              <div
                key={`${frameIndex}-${ei}`}
                className="flex items-center gap-2 pl-4 bg-muted/30 rounded py-1 pr-1"
              >
                <span className="text-[10px] text-muted-foreground w-8 shrink-0">
                  #{frameIndex}
                </span>
                <Select
                  value={ev.type}
                  onValueChange={(v) => {
                    const newType = v as FrameEvent["type"];
                    let newEv: FrameEvent;
                    if (newType === "play_audio") {
                      newEv = { type: "play_audio", audioId: "footstep" };
                    } else if (newType === "launch_projectile") {
                      newEv = { type: "launch_projectile" };
                    } else if (newType === "animate_tiles") {
                      newEv = { type: "animate_tiles" };
                    } else {
                      newEv = { type: "target_hurt" };
                    }
                    updateFrameEvent(frameIndex, ei, newEv);
                  }}
                >
                  <SelectTrigger className="h-7 text-[10px] w-28 shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FRAME_EVENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {ev.type === "play_audio" && (
                  <Select
                    value={ev.audioId}
                    onValueChange={(v) => {
                      updateFrameEvent(frameIndex, ei, {
                        type: "play_audio",
                        audioId: v as Extract<
                          FrameEvent,
                          { type: "play_audio" }
                        >["audioId"],
                      });
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
                  onClick={() => removeFrameEvent(frameIndex, ei)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )),
          )}
        </div>
      )}
    </div>
  );
}

function FrameEventAdder({
  onAdd,
}: {
  onAdd: (frameIndex: string, event: FrameEvent) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" className="h-6 text-xs">
          <Plus className="h-3 w-3 mr-1" /> Event
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-2 space-y-2" align="end">
        <FrameEventAdderContent onAdd={onAdd} />
      </PopoverContent>
    </Popover>
  );
}

function FrameEventAdderContent({
  onAdd,
}: {
  onAdd: (frameIndex: string, event: FrameEvent) => void;
}) {
  const [frameIndex, setFrameIndex] = useState("0");

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-xs">Frame #</Label>
        <Input
          type="number"
          className="h-7 w-14 text-xs"
          value={frameIndex}
          onChange={(e) => setFrameIndex(e.target.value)}
          min={0}
        />
      </div>
      <div className="flex flex-col gap-1">
        {FRAME_EVENT_TYPES.map((type) => (
          <Button
            key={type}
            variant="ghost"
            size="sm"
            className="h-7 justify-start text-xs"
            onClick={() => {
              const event: FrameEvent =
                type === "play_audio"
                  ? { type: "play_audio", audioId: "footstep" }
                  : { type };
              onAdd(frameIndex, event);
            }}
          >
            {type}
          </Button>
        ))}
      </div>
    </div>
  );
}
