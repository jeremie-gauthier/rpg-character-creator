# Add Effect Popover Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the row of 9 per-type "Add X" buttons with a single `+ Add Effect` button that opens a searchable, grouped popover.

**Architecture:** Add a `SIDE_EFFECT_OPTIONS` constant and an `AddEffectPopover` component inside `SkillEditor.tsx`. The component wraps shadcn `Popover` + `Input` for filtering. Both the skill-level and reaction-skill sections are updated to use it.

**Tech Stack:** React, TypeScript, shadcn `Popover`/`PopoverTrigger`/`PopoverContent`, shadcn `Input`, Vitest + @testing-library/react

---

### Task 1: Extract a pure filter helper and write its test

**Files:**
- Modify: `src/components/SkillEditor.tsx` (add constant + helper near top, after existing constants)
- Test: `src/components/SkillEditor.test.tsx` (new file)

**Step 1: Add `SIDE_EFFECT_OPTIONS` constant and `filterEffectOptions` helper to `SkillEditor.tsx`**

Insert after the existing constants at the top of the file (after line 29, the `CONDITION_NAMES` line):

```tsx
type EffectOption = {
  label: string;
  group: "Damage & Healing" | "Movement" | "Status";
  default: SideEffect;
};

const SIDE_EFFECT_OPTIONS: EffectOption[] = [
  { label: "Damage",          group: "Damage & Healing", default: { type: "apply-damage",           subject: "target", damageMin: 0, damageMax: 1, radius: 0, minRadius: 0, shape: "diamond" } },
  { label: "Heal",            group: "Damage & Healing", default: { type: "apply-heal",             subject: "target", healMin: 0, healMax: 1 } },
  { label: "Corruption",      group: "Damage & Healing", default: { type: "apply-corruption",       subject: "target", corruptionMin: 0, corruptionMax: 1 } },
  { label: "Heal Corruption", group: "Damage & Healing", default: { type: "apply-heal-corruption",  subject: "target", healMin: 0, healMax: 1 } },
  { label: "Charge",          group: "Movement",         default: { type: "charge-target" } },
  { label: "Pull",            group: "Movement",         default: { type: "pull-target" } },
  { label: "Push",            group: "Movement",         default: { type: "push-target", pushForce: 1 } },
  { label: "Condition",       group: "Status",           default: { type: "apply-condition",        subject: "target", condition: { name: "damageReduction", durationMax: 1 } } },
  { label: "Cleanse",         group: "Status",           default: { type: "apply-condition-cleanse", subject: "target", conditionCleaner: "all" } },
];

export function filterEffectOptions(query: string): EffectOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return SIDE_EFFECT_OPTIONS;
  return SIDE_EFFECT_OPTIONS.filter((o) => o.label.toLowerCase().includes(q));
}
```

**Step 2: Write the failing test in `src/components/SkillEditor.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { filterEffectOptions } from "./SkillEditor";

describe("filterEffectOptions", () => {
  it("returns all options for empty query", () => {
    expect(filterEffectOptions("").length).toBe(9);
  });

  it("returns all options for whitespace-only query", () => {
    expect(filterEffectOptions("   ").length).toBe(9);
  });

  it("filters case-insensitively by label", () => {
    const results = filterEffectOptions("heal");
    expect(results.map((o) => o.label)).toEqual(["Heal", "Heal Corruption"]);
  });

  it("returns empty array when nothing matches", () => {
    expect(filterEffectOptions("zzz")).toEqual([]);
  });
});
```

**Step 3: Run test to verify it fails**

```bash
rtk vitest run src/components/SkillEditor.test.tsx
```

Expected: FAIL — `filterEffectOptions` is not yet exported.

**Step 4: Add the `export` keyword to `filterEffectOptions` in `SkillEditor.tsx`** (already included in step 1 above).

**Step 5: Run test to verify it passes**

```bash
rtk vitest run src/components/SkillEditor.test.tsx
```

Expected: PASS (4 tests)

**Step 6: Commit**

```bash
rtk git add src/components/SkillEditor.tsx src/components/SkillEditor.test.tsx
rtk git commit -m "feat: add SIDE_EFFECT_OPTIONS constant and filterEffectOptions helper"
```

---

### Task 2: Build the `AddEffectPopover` component

**Files:**
- Modify: `src/components/SkillEditor.tsx` (add component after `filterEffectOptions`, before `SkillEditor`)

**Step 1: Add `AddEffectPopover` to `SkillEditor.tsx`**

Add these imports at the top of the file (merge into existing import lines):

```tsx
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
```

Then add the component after `filterEffectOptions`:

```tsx
function AddEffectPopover({ onAdd, triggerClassName }: { onAdd: (effect: SideEffect) => void; triggerClassName?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const groups = (["Damage & Healing", "Movement", "Status"] as const);
  const filtered = filterEffectOptions(query);

  const handleSelect = (effect: SideEffect) => {
    onAdd(effect);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQuery(""); }}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" className={triggerClassName}>
          <Plus className="h-3 w-3 mr-1" /> Add Effect
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search effects…"
          className="w-full rounded border border-input bg-background px-2 py-1 text-sm outline-none mb-2"
        />
        <div className="max-h-64 overflow-y-auto space-y-2">
          {groups.map((group) => {
            const items = filtered.filter((o) => o.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group}>
                <p className="text-xs text-muted-foreground px-1 mb-1">{group}</p>
                {items.map((o) => (
                  <button
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
            <p className="text-xs text-muted-foreground px-1">No effects match.</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

**Step 2: Run dev server to visually check nothing is broken yet**

```bash
bun dev
```

Expected: app starts without errors (component not yet used).

**Step 3: Commit**

```bash
rtk git add src/components/SkillEditor.tsx
rtk git commit -m "feat: add AddEffectPopover component"
```

---

### Task 3: Wire `AddEffectPopover` into the skill-level side effects section

**Files:**
- Modify: `src/components/SkillEditor.tsx` lines ~162–193

**Step 1: Replace the button row with `AddEffectPopover`**

Find this block (around line 163–192):

```tsx
<div className="flex gap-1 flex-wrap">
  <Button size="sm" variant="outline" onClick={() => update({ sideEffects: [...skill.sideEffects, { type: "apply-damage", subject: "target", damageMin: 0, damageMax: 1, radius: 0, minRadius: 0, shape: "diamond" }] })}>
    <Plus className="h-3 w-3 mr-1" /> Damage
  </Button>
  {/* ... all 9 buttons ... */}
</div>
```

Replace the entire `<div className="flex gap-1 flex-wrap">` block with:

```tsx
<AddEffectPopover onAdd={(effect) => update({ sideEffects: [...skill.sideEffects, effect] })} />
```

**Step 2: Run the dev server and manually verify**

```bash
bun dev
```

Open the app, create a skill, click `+ Add Effect`, type "heal", click "Heal Corruption" — confirm the effect is added.

**Step 3: Commit**

```bash
rtk git add src/components/SkillEditor.tsx
rtk git commit -m "feat: replace skill-level side effect buttons with AddEffectPopover"
```

---

### Task 4: Wire `AddEffectPopover` into the reaction-skill side effects section

**Files:**
- Modify: `src/components/SkillEditor.tsx` lines ~785–800

**Step 1: Replace the reaction-skill button row**

Find the block (around line 787–800):

```tsx
<div className="flex gap-1 flex-wrap">
  <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => update({ sideEffects: [...rs.sideEffects, { type: "apply-damage", ... }] })}>
    ...
  </Button>
  {/* ... 4 buttons ... */}
</div>
```

Replace the entire `<div className="flex gap-1 flex-wrap">` block with:

```tsx
<AddEffectPopover
  onAdd={(effect) => update({ sideEffects: [...rs.sideEffects, effect] })}
  triggerClassName="h-6 text-xs"
/>
```

**Step 2: Run dev server and verify**

```bash
bun dev
```

Open the app, add a Defensive/Offensive Stance condition (which has a reaction skill), open the reaction skill section, use `+ Add Effect` — confirm it works.

**Step 3: Run all tests**

```bash
rtk vitest run
```

Expected: all tests pass.

**Step 4: Commit**

```bash
rtk git add src/components/SkillEditor.tsx
rtk git commit -m "feat: replace reaction-skill side effect buttons with AddEffectPopover"
```
