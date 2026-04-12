import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { filterEffectOptions } from "@/lib/skill-utils";
import type { SideEffect } from "@/types/actor";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";

const GROUPS = ["Damage & Healing", "Movement", "Status"] as const;

export function AddEffectPopover({
  onAdd,
  triggerClassName,
}: {
  onAdd: (effect: SideEffect) => void;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const filtered = filterEffectOptions(query);

  const handleSelect = (effect: SideEffect) => {
    onAdd(effect);
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
        <Button size="sm" variant="outline" className={triggerClassName}>
          <Plus className="h-3 w-3 mr-1" /> Add Effect
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-56 p-2"
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
          placeholder="Search effects…"
          className="w-full mb-2"
        />
        <div className="max-h-64 overflow-y-auto space-y-2">
          {GROUPS.map((group) => {
            const items = filtered.filter((o) => o.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group}>
                <p className="text-xs text-muted-foreground px-1 mb-1">
                  {group}
                </p>
                {items.map((o) => (
                  <button
                    type="button"
                    key={o.label}
                    onClick={() => handleSelect(o.default)}
                    className="w-full text-left px-2 py-1 text-sm rounded hover:bg-accent hover:text-accent-foreground"
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground px-1">
              No effects match.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
