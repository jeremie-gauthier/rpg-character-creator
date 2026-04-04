# Per-Condition Side Effects Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `apply-damage-per-condition` and `apply-heal-per-condition` side effect types to match the updated actor schema.

**Architecture:** Add the two new variants to the `SideEffect` union in `actor.ts`, then add SIDE_EFFECT_OPTIONS entries and `SideEffectRow` rendering branches in `SkillEditor.tsx`.

**Tech Stack:** TypeScript, React, Vitest, shadcn/ui

---

### Task 1: Add new SideEffect types to actor.ts

**Files:**
- Modify: `src/types/actor.ts`

**Step 1: Add the two new variants to the SideEffect union**

In `src/types/actor.ts`, after the `apply-condition-cleanse` variant (line 92–101), add:

```ts
  | {
      type: "apply-damage-per-condition";
      subject: Subject;
      conditionName: ConditionName;
      damagePerStack: number;
      radius?: number;
      minRadius?: number;
      shape?: AoeShape;
    }
  | {
      type: "apply-heal-per-condition";
      subject: Subject;
      conditionName: ConditionName;
      healPerStack: number;
      radius?: number;
      minRadius?: number;
      shape?: AoeShape;
    };
```

**Step 2: Verify TypeScript compiles**

```bash
rtk tsc
```
Expected: no errors

**Step 3: Commit**

```bash
rtk git add src/types/actor.ts
rtk git commit -m "feat: add apply-damage-per-condition and apply-heal-per-condition types"
```

---

### Task 2: Add SIDE_EFFECT_OPTIONS entries in SkillEditor

**Files:**
- Modify: `src/components/SkillEditor.tsx:41-51`

**Step 1: Add two new entries to SIDE_EFFECT_OPTIONS after the `Cleanse` entry (line 50)**

```ts
  { label: "Dmg/Condition",  group: "Damage & Healing", default: { type: "apply-damage-per-condition", subject: "target", conditionName: "bleeding", damagePerStack: 1 } },
  { label: "Heal/Condition", group: "Damage & Healing", default: { type: "apply-heal-per-condition",  subject: "target", conditionName: "bleeding", healPerStack: 1 } },
```

**Step 2: Verify TypeScript compiles**

```bash
rtk tsc
```
Expected: no errors

---

### Task 3: Add SideEffectRow rendering for the two new types

**Files:**
- Modify: `src/components/SkillEditor.tsx` — `SideEffectRow` function (around line 453)

**Step 1: Add a new `if` branch before the `apply-corruption` block (line 684)**

The new branch handles both new types together. Insert before the `// apply-corruption or apply-heal-corruption` comment:

```tsx
  // apply-damage-per-condition or apply-heal-per-condition
  if (effect.type === "apply-damage-per-condition" || effect.type === "apply-heal-per-condition") {
    const isDamage = effect.type === "apply-damage-per-condition";
    const label = isDamage ? "dmg/condition" : "heal/condition";
    const perStack = isDamage ? effect.damagePerStack : effect.healPerStack;
    const radius = effect.radius ?? 0;
    const minRadius = effect.minRadius ?? 0;
    const shape = effect.shape || "diamond";

    return (
      <div className="bg-muted rounded-md p-2 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground w-28 shrink-0">{label}</span>
          <Select value={effect.subject} onValueChange={(v) => onChange({ ...effect, subject: v as "target" | "caster" })}>
            <SelectTrigger className="h-8 text-xs w-20"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="target">target</SelectItem>
              <SelectItem value="caster">caster</SelectItem>
            </SelectContent>
          </Select>
          <Select value={effect.conditionName} onValueChange={(v) => onChange({ ...effect, conditionName: v as ConditionName })}>
            <SelectTrigger className="h-8 text-xs w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CONDITION_NAMES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
          <Label className="text-xs">{isDamage ? "Dmg/stack" : "Heal/stack"}</Label>
          <Input
            type="number"
            className="h-8 w-16"
            value={perStack}
            min={1}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              onChange(isDamage ? { ...effect, damagePerStack: val } : { ...effect, healPerStack: val });
            }}
          />
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 ml-auto" onClick={onDelete}><Trash2 className="h-3 w-3" /></Button>
        </div>
        <AoeBlock
          radius={radius}
          minRadius={minRadius}
          shape={shape}
          shapes={AOE_SHAPES}
          onChange={(patch) => onChange({ ...effect, ...patch })}
        />
      </div>
    );
  }
```

**Step 2: Verify TypeScript compiles**

```bash
rtk tsc
```
Expected: no errors

**Step 3: Run tests**

```bash
rtk vitest run
```
Expected: all pass

**Step 4: Commit**

```bash
rtk git add src/components/SkillEditor.tsx
rtk git commit -m "feat: add apply-damage-per-condition and apply-heal-per-condition to SkillEditor"
```
