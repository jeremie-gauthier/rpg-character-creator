import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  PREDEFINED_ANIMATIONS,
  type PresetAnimationKey,
} from "@/data/predefined-animations";
import { filterPresetAnimations } from "@/lib/skill-utils";
import type { AnimationDefinition } from "@/types/actor";
import { Wand2 } from "lucide-react";
import { useRef, useState } from "react";

export function PresetAnimationPopover({
  onSelect,
}: {
  onSelect: (frames: AnimationDefinition[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const filtered = filterPresetAnimations(query);

  const handleSelect = (key: PresetAnimationKey) => {
    onSelect(PREDEFINED_ANIMATIONS[key]);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" className="h-6 text-xs">
          <Wand2 className="h-3 w-3 mr-1" /> Preset
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-48 p-2"
        align="end"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search presets…"
          className="w-full mb-2"
        />
        <div className="max-h-64 overflow-y-auto space-y-1">
          {filtered.length > 0 ? (
            filtered.map((key) => (
              <button
                type="button"
                key={key}
                className="w-full text-left text-xs px-2 py-1 rounded hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleSelect(key)}
              >
                {key}
              </button>
            ))
          ) : (
            <p className="text-xs text-muted-foreground px-1">
              No presets match.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
