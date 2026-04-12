import {
  type SideEffect,
  type AoeShape,
  type ConditionName,
  type AnimationDefinition,
} from "@/types/actor";
import {
  PREDEFINED_ANIMATION_KEYS,
  type PresetAnimationKey,
} from "@/data/predefined-animations";

export const AUDIO_IDS = [
  "footstep",
  "door",
  "chest",
  "chest_close",
  "ui_click",
  "sword_attack",
  "hurt",
  "fireball",
  "fire_explosion",
  "wildfire",
] as const;

export const AOE_SHAPES: AoeShape[] = [
  "diamond",
  "square",
  "circle",
  "cross",
  "diagonal",
];

export const AOE_SHAPES_NO_DIAGONAL: AoeShape[] = [
  "diamond",
  "square",
  "circle",
  "cross",
];

export const CONDITION_NAMES: ConditionName[] = [
  "damageReduction",
  "damageAugmentation",
  "defensiveStance",
  "offensiveStance",
  "bleeding",
  "burning",
];

export type EffectOption = {
  readonly label: string;
  readonly group: "Damage & Healing" | "Movement" | "Status";
  readonly default: SideEffect;
};

export const SIDE_EFFECT_OPTIONS: readonly EffectOption[] = [
  {
    label: "Damage",
    group: "Damage & Healing",
    default: {
      type: "apply-damage",
      subject: "target",
      damageMin: 0,
      damageMax: 1,
      radius: 0,
      minRadius: 0,
      shape: "diamond",
    },
  },
  {
    label: "Heal",
    group: "Damage & Healing",
    default: {
      type: "apply-heal",
      subject: "target",
      healMin: 0,
      healMax: 1,
      radius: 0,
      minRadius: 0,
      shape: "diamond",
    },
  },
  {
    label: "Corruption",
    group: "Damage & Healing",
    default: {
      type: "apply-corruption",
      subject: "target",
      corruptionMin: 0,
      corruptionMax: 1,
      radius: 0,
      minRadius: 0,
      shape: "diamond",
    },
  },
  {
    label: "Heal Corruption",
    group: "Damage & Healing",
    default: {
      type: "apply-heal-corruption",
      subject: "target",
      healMin: 0,
      healMax: 1,
    },
  },
  {
    label: "Damage per Condition",
    group: "Damage & Healing",
    default: {
      type: "apply-damage-per-condition",
      subject: "target",
      conditionName: "bleeding",
      damagePerStack: 1,
    },
  },
  {
    label: "Heal per Condition",
    group: "Damage & Healing",
    default: {
      type: "apply-heal-per-condition",
      subject: "target",
      conditionName: "bleeding",
      healPerStack: 1,
    },
  },
  { label: "Charge", group: "Movement", default: { type: "charge-target" } },
  { label: "Pull", group: "Movement", default: { type: "pull-target" } },
  {
    label: "Push",
    group: "Movement",
    default: { type: "push-target", pushForce: 1 },
  },
  {
    label: "Condition",
    group: "Status",
    default: {
      type: "apply-condition",
      subject: "target",
      condition: { name: "damageReduction", durationMax: 1 },
    },
  },
  {
    label: "Cleanse",
    group: "Status",
    default: {
      type: "apply-condition-cleanse",
      subject: "target",
      conditionCleaner: "all",
    },
  },
];

export function filterEffectOptions(query: string): EffectOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...SIDE_EFFECT_OPTIONS];
  return SIDE_EFFECT_OPTIONS.filter((o) => o.label.toLowerCase().includes(q));
}

export function filterPresetAnimations(query: string): PresetAnimationKey[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...PREDEFINED_ANIMATION_KEYS];
  return PREDEFINED_ANIMATION_KEYS.filter((k) => k.toLowerCase().includes(q));
}
