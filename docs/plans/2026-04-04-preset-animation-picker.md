# Preset Animation Picker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a preset animation picker popover next to `+ Frame` in the animation frames section of `SkillEditor`, allowing users to replace the current frames with a named predefined animation.

**Architecture:** Create a data file mirroring `COMMON_ANIMATION_DEFINITIONS` with literal audioId strings; add a `filterPresetAnimations` helper + `PresetAnimationPopover` component (modeled after the existing `AddEffectPopover`); extract the 4 duplicated animation-frames JSX blocks into a shared `AnimationFramesSection` component that houses the popover.

**Tech Stack:** React, TypeScript, Vitest, shadcn/ui (`Popover`, `Button`), Lucide icons

---

### Task 1: Create predefined animations data file

**Files:**
- Create: `src/data/predefined-animations.ts`

**Step 1: Create the file**

```ts
import type { AnimationDefinition } from "@/types/actor";

export const PREDEFINED_ANIMATIONS = {
  idle: [
    { columnIdx: 0, frameDurationMs: 500 },
    { columnIdx: 1, frameDurationMs: 500 },
  ],
  walk: [
    { columnIdx: 2, frameDurationMs: 75, frameEvents: [{ type: "play_audio" as const, audioId: "footstep" as const }] },
    { columnIdx: 3, frameDurationMs: 75 },
    { columnIdx: 4, frameDurationMs: 75, frameEvents: [{ type: "play_audio" as const, audioId: "footstep" as const }] },
  ],
  melee_attack: [
    { columnIdx: 5, frameDurationMs: 120 },
    { columnIdx: 6, frameDurationMs: 120, frameEvents: [{ type: "play_audio" as const, audioId: "sword_attack" as const }] },
    { columnIdx: 7, frameDurationMs: 120 },
    { columnIdx: 8, frameDurationMs: 120 },
  ],
  range_attack: [
    { columnIdx: 9, frameDurationMs: 120 },
    { columnIdx: 10, frameDurationMs: 120 },
    { columnIdx: 11, frameDurationMs: 120 },
    { columnIdx: 12, frameDurationMs: 120 },
  ],
  magic_attack: [
    { columnIdx: 13, frameDurationMs: 150 },
    { columnIdx: 14, frameDurationMs: 150 },
    { columnIdx: 15, frameDurationMs: 150 },
  ],
  bare_hand_attack: [
    { columnIdx: 16, frameDurationMs: 120 },
    { columnIdx: 17, frameDurationMs: 120 },
    { columnIdx: 18, frameDurationMs: 120 },
  ],
  hurt: [
    { columnIdx: 19, frameDurationMs: 150, frameEvents: [{ type: "play_audio" as const, audioId: "hurt" as const }] },
    { columnIdx: 20, frameDurationMs: 150 },
    { columnIdx: 21, frameDurationMs: 150 },
  ],
  slide: [
    { columnIdx: 21, frameDurationMs: 10000 },
  ],
  death: [
    { columnIdx: 22, frameDurationMs: 200 },
    { columnIdx: 23, frameDurationMs: 200 },
    { columnIdx: 24, frameDurationMs: 200 },
  ],
  defensive_stance: [
    { columnIdx: 5, frameDurationMs: 500 },
    { columnIdx: 6, frameDurationMs: 500 },
  ],
} satisfies Record<string, AnimationDefinition[]>;

export type PresetAnimationKey = keyof typeof PREDEFINED_ANIMATIONS;
export const PREDEFINED_ANIMATION_KEYS = Object.keys(PREDEFINED_ANIMATIONS) as PresetAnimationKey[];
```

**Step 2: Verify it compiles**

```bash
rtk tsc --noEmit
```
Expected: no errors

**Step 3: Commit**

```bash
rtk git add src/data/predefined-animations.ts
rtk git commit -m "feat: add predefined animations data"
```

---

### Task 2: Add `filterPresetAnimations` to SkillEditor and write tests

**Files:**
- Modify: `src/components/SkillEditor.tsx` (after the `filterEffectOptions` function, ~line 59)
- Modify: `src/components/SkillEditor.test.tsx`

**Step 1: Write the failing tests first**

In `src/components/SkillEditor.test.tsx`, add after the existing `describe` block:

```ts
import { filterPresetAnimations } from "./SkillEditor";

describe("filterPresetAnimations", () => {
  it("returns all keys for empty query", () => {
    expect(filterPresetAnimations("").length).toBe(10);
  });

  it("returns all keys for whitespace-only query", () => {
    expect(filterPresetAnimations("   ").length).toBe(10);
  });

  it("filters case-insensitively by key name", () => {
    const results = filterPresetAnimations("attack");
    expect(results).toEqual(["melee_attack", "range_attack", "magic_attack", "bare_hand_attack"]);
  });

  it("returns empty array when nothing matches", () => {
    expect(filterPresetAnimations("zzz")).toEqual([]);
  });
});
```

**Step 2: Run tests to confirm they fail**

```bash
rtk vitest run src/components/SkillEditor.test.tsx
```
Expected: FAIL — `filterPresetAnimations` not exported

**Step 3: Add the export to SkillEditor.tsx**

After the `filterEffectOptions` function (~line 59), add:

```ts
export function filterPresetAnimations(query: string): PresetAnimationKey[] {
  const q = query.trim().toLowerCase();
  if (!q) return PREDEFINED_ANIMATION_KEYS;
  return PREDEFINED_ANIMATION_KEYS.filter((k) => k.toLowerCase().includes(q));
}
```

Also add to the imports at the top of `SkillEditor.tsx`:

```ts
import { PREDEFINED_ANIMATIONS, PREDEFINED_ANIMATION_KEYS, type PresetAnimationKey } from "@/data/predefined-animations";
```

**Step 4: Run tests to confirm they pass**

```bash
rtk vitest run src/components/SkillEditor.test.tsx
```
Expected: all PASS

**Step 5: Commit**

```bash
rtk git add src/components/SkillEditor.tsx src/components/SkillEditor.test.tsx
rtk git commit -m "feat: add filterPresetAnimations with tests"
```

---

### Task 3: Add `PresetAnimationPopover` component

**Files:**
- Modify: `src/components/SkillEditor.tsx`

The component goes right after the `AddEffectPopover` function (after ~line 121). Also add `Wand2` to the lucide-react import on line 21.

**Step 1: Add `Wand2` to the lucide import**

Change line 21 from:
```ts
import { ChevronDown, GripVertical, ImagePlus, Plus, Trash2 } from "lucide-react";
```
to:
```ts
import { ChevronDown, GripVertical, ImagePlus, Plus, Trash2, Wand2 } from "lucide-react";
```

**Step 2: Insert the component after `AddEffectPopover` (after ~line 121)**

```tsx
function PresetAnimationPopover({ onSelect }: { onSelect: (frames: AnimationDefinition[]) => void }) {
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
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQuery(""); }}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" className="h-6 text-xs">
          <Wand2 className="h-3 w-3 mr-1" /> Preset
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-48 p-2"
        align="end"
        onOpenAutoFocus={(e) => { e.preventDefault(); inputRef.current?.focus(); }}
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
                key={key}
                className="w-full text-left text-xs px-2 py-1 rounded hover:bg-accent"
                onClick={() => handleSelect(key)}
              >
                {key}
              </button>
            ))
          ) : (
            <p className="text-xs text-muted-foreground px-1">No presets match.</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

**Step 3: Verify it compiles**

```bash
rtk tsc --noEmit
```
Expected: no errors

**Step 4: Commit**

```bash
rtk git add src/components/SkillEditor.tsx
rtk git commit -m "feat: add PresetAnimationPopover component"
```

---

### Task 4: Extract `AnimationFramesSection` and wire up the popover

**Files:**
- Modify: `src/components/SkillEditor.tsx`

The animation-frames block appears at lines ~541–576, ~670–705, ~804–839, ~887–922. They are all identical except for how `effect` and `onChange` are referenced. The extracted component standardizes these into `animation`, `loop`, `spriteSheet`, and `onChange` props.

**Step 1: Add the component after `PresetAnimationPopover`**

```tsx
function AnimationFramesSection({
  animation,
  loop,
  spriteSheet,
  onChange,
}: {
  animation: AnimationDefinition[];
  loop: boolean;
  spriteSheet: string | undefined;
  onChange: (patch: { animation?: AnimationDefinition[]; loop?: boolean }) => void;
}) {
  return (
    <div className="pl-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">Animation Frames</span>
          <div className="flex items-center gap-1">
            <Checkbox checked={loop} onCheckedChange={(v) => onChange({ loop: !!v })} />
            <Label className="text-xs">Loop</Label>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <PresetAnimationPopover onSelect={(frames) => onChange({ animation: frames })} />
          <Button
            size="sm"
            variant="outline"
            className="h-6 text-xs"
            onClick={() => onChange({ animation: [...animation, { columnIdx: 0, frameDurationMs: 150 }] })}
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
          onDelete={() => onChange({ animation: animation.filter((_, i) => i !== fi) })}
        />
      ))}

      {animation.length > 0 && (
        <AnimationPreview spriteSheetSrc={spriteSheet} frames={animation} loop={loop} />
      )}
    </div>
  );
}
```

**Step 2: Replace the first animation-frames block (~lines 541–576)**

Replace:
```tsx
        {/* Animation frames */}
        <div className="pl-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">Animation Frames</span>
              <div className="flex items-center gap-1">
                <Checkbox checked={!!effect.loop} onCheckedChange={(v) => onChange({ ...effect, loop: !!v })} />
                <Label className="text-xs">Loop</Label>
              </div>
            </div>
            <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => onChange({ ...effect, animation: [...(effect.animation || []), { columnIdx: 0, frameDurationMs: 150 }] })}>
              <Plus className="h-3 w-3 mr-1" /> Frame
            </Button>
          </div>

          {(effect.animation || []).map((frame, fi) => (
            <AnimationFrameRow
              key={fi}
              frame={frame}
              onChange={(f) => {
                const anim = [...(effect.animation || [])];
                anim[fi] = f;
                onChange({ ...effect, animation: anim });
              }}
              onDelete={() => onChange({ ...effect, animation: (effect.animation || []).filter((_, i) => i !== fi) })}
            />
          ))}

          {(effect.animation || []).length > 0 && (
            <AnimationPreview
              spriteSheetSrc={spriteSheet}
              frames={effect.animation || []}
              loop={!!effect.loop}
            />
          )}
        </div>
```

With (first occurrence — inside `apply-condition` block around line 541):
```tsx
        <AnimationFramesSection
          animation={effect.animation || []}
          loop={!!effect.loop}
          spriteSheet={spriteSheet}
          onChange={(patch) => onChange({ ...effect, ...(patch.animation !== undefined ? { animation: patch.animation } : {}), ...(patch.loop !== undefined ? { loop: patch.loop } : {}) })}
        />
```

**Step 3: Replace the second animation-frames block (~lines 670–705)**

Same replacement, second occurrence (also inside `apply-condition` variant):
```tsx
        <AnimationFramesSection
          animation={effect.animation || []}
          loop={!!effect.loop}
          spriteSheet={spriteSheet}
          onChange={(patch) => onChange({ ...effect, ...(patch.animation !== undefined ? { animation: patch.animation } : {}), ...(patch.loop !== undefined ? { loop: patch.loop } : {}) })}
        />
```

**Step 4: Replace the third animation-frames block (~lines 804–839)**

```tsx
        <AnimationFramesSection
          animation={effect.animation || []}
          loop={!!effect.loop}
          spriteSheet={spriteSheet}
          onChange={(patch) => onChange({ ...effect, ...(patch.animation !== undefined ? { animation: patch.animation } : {}), ...(patch.loop !== undefined ? { loop: patch.loop } : {}) })}
        />
```

**Step 5: Replace the fourth animation-frames block (~lines 887–922)**

```tsx
      <AnimationFramesSection
        animation={effect.animation || []}
        loop={!!effect.loop}
        spriteSheet={spriteSheet}
        onChange={(patch) => onChange({ ...effect, ...(patch.animation !== undefined ? { animation: patch.animation } : {}), ...(patch.loop !== undefined ? { loop: patch.loop } : {}) })}
      />
```

(Note: this one has one less level of indentation — it's the final `apply-damage`/`apply-heal` block.)

**Step 6: Verify it compiles**

```bash
rtk tsc --noEmit
```
Expected: no errors

**Step 7: Run all tests**

```bash
rtk vitest run
```
Expected: all PASS

**Step 8: Commit**

```bash
rtk git add src/components/SkillEditor.tsx
rtk git commit -m "feat: extract AnimationFramesSection and add preset animation picker"
```

---

### Task 5: Manual verification

Start dev server and verify the feature end-to-end:

```bash
bun dev
```

1. Open `http://localhost:8080`, create/edit a character with a skill
2. Add a side effect (e.g., Damage)
3. In the Animation Frames section, click the **Preset** button — popover should open
4. Type "att" in the search — should filter to `melee_attack`, `range_attack`, `magic_attack`, `bare_hand_attack`
5. Click `melee_attack` — frames should be replaced with 4 frames (col 5–8), one with a `sword_attack` audio event
6. Click `+ Frame` — should still add a blank frame as before
7. Confirm the `Loop` checkbox still works independently
8. Repeat for a different effect type (e.g., Heal) to verify all 4 call sites work
