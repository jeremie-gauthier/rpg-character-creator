# Preset Animation Picker — Design

## Goal

Add a preset animation picker next to the `+ Frame` button in the animation frames section of `SkillEditor`. Selecting a preset replaces the current frames with the predefined animation's frames.

## Data

**New file:** `src/data/predefined-animations.ts`

Mirrors `COMMON_ANIMATION_DEFINITIONS` from the dungeon-crawler-tactic project. Uses literal `audioId` strings compatible with this project's `FrameEvent` type (`"footstep"`, `"sword_attack"`, `"hurt"`). No external imports.

Exports:
- `PREDEFINED_ANIMATIONS` — the full data object
- `PREDEFINED_ANIMATION_KEYS` — top-level keys as a string array

## Components

### `PresetAnimationPopover`

Inline component in `SkillEditor.tsx`, modeled after `AddEffectPopover`.

- **Trigger:** small button (Wand2 icon + "Preset" label) to the left of `+ Frame`
- **Popover content:** search input + scrollable list of preset keys
- **On pick:** calls `onSelect(frames: AnimationDefinition[])` → parent sets `effect.animation = frames`
- **State:** `open: boolean`, `query: string`

### `AnimationFramesSection`

Extracts the 4 identical animation-frames JSX blocks into a shared component.

**Props:**
```ts
{
  animation: AnimationDefinition[];
  loop: boolean;
  spriteSheet: string | undefined;
  onChange(patch: { animation?: AnimationDefinition[]; loop?: boolean }): void;
}
```

**Contains:** Loop checkbox, `PresetAnimationPopover`, `+ Frame` button, `AnimationFrameRow` list, `AnimationPreview`.

The 4 existing call sites become single `<AnimationFramesSection ... />` elements.

## Behavior

- Picking a preset **replaces** existing frames entirely.
- Audio frame events are included (copied verbatim from the preset data).
- The `loop` flag is not changed by the preset picker.
