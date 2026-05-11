import type { AnimationDefinition } from "@/types/actor";

/**
 * Available animation tag names that can be referenced in side effects.
 * These correspond to frameTags in the shared animations.json (Aseprite export).
 */
export const ANIMATION_TAGS = [
  "idle",
  "walk",
  "melee_attack",
  "range_attack",
  "magic_attack",
  "bare_hand_attack",
  "hurt",
  "slide",
  "death",
  "defensive_stance",
] as const;

export type AnimationTag = (typeof ANIMATION_TAGS)[number];

/**
 * Predefined animation frame data — used only for projectile/tileAnimation
 * definitions that still use the columnIdx-based format.
 */
export const PREDEFINED_ANIMATIONS = {
  idle: [
    { columnIdx: 0, frameDurationMs: 500 },
    { columnIdx: 1, frameDurationMs: 500 },
  ],
  walk: [
    { columnIdx: 2, frameDurationMs: 75, frameEvents: [{ type: "play_audio", audioId: "footstep" }] },
    { columnIdx: 3, frameDurationMs: 75 },
    { columnIdx: 4, frameDurationMs: 75, frameEvents: [{ type: "play_audio", audioId: "footstep" }] },
  ],
  melee_attack: [
    { columnIdx: 5, frameDurationMs: 120 },
    { columnIdx: 6, frameDurationMs: 120, frameEvents: [{ type: "play_audio", audioId: "sword_attack" }] },
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
    { columnIdx: 19, frameDurationMs: 150, frameEvents: [{ type: "play_audio", audioId: "hurt" }] },
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
