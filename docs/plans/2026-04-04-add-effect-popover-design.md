# Add Effect Popover with Search — Design

## Problem

The side effect section in `SkillEditor.tsx` currently renders one button per effect type in a flex-wrap row. With 9 types today and more planned, this is visually cluttered and hard to scan.

## Solution

Replace the button row with a single `+ Add Effect` button that opens a shadcn `Popover` containing a searchable, grouped list of effect types.

## Components

**Trigger**
- Single `+ Add Effect` button (same `size="sm" variant="outline"` as current buttons)
- Replaces all per-type buttons in both the skill-level and reaction-skill side-effect sections

**Popover**
- shadcn `Popover` + `PopoverContent`
- Autofocused `Input` with placeholder `"Search effects…"`
- Scrollable list of entries filtered by label (case-insensitive substring match)
- Grouped by category with muted section labels; empty groups hidden during search

**Groups and entries**

| Group | Entries |
|---|---|
| Damage & Healing | Damage, Heal, Corruption, Heal Corruption |
| Movement | Charge, Pull, Push |
| Status | Condition, Cleanse |

**Interaction**
- Clicking an entry → adds effect with its default values → closes popover
- Outside click → closes popover
- No confirm step

## Shared constant

A single `SIDE_EFFECT_OPTIONS` constant (array of `{ label, group, defaultValue }`) defined once in `SkillEditor.tsx` and consumed by both the skill-level and reaction-skill sections via a shared `AddEffectPopover` component.

## Scope

- `src/components/SkillEditor.tsx` only — no type changes, no new files
