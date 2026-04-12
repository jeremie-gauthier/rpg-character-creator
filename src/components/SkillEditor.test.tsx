import { describe, it, expect } from "vitest";
import { filterEffectOptions, filterPresetAnimations } from "@/lib/skill-utils";
import { PREDEFINED_ANIMATION_KEYS } from "@/data/predefined-animations";

describe("filterEffectOptions", () => {
  it("returns all options for empty query", () => {
    expect(filterEffectOptions("").length).toBe(11);
  });

  it("returns all options for whitespace-only query", () => {
    expect(filterEffectOptions("   ").length).toBe(11);
  });

  it("filters case-insensitively by label", () => {
    const results = filterEffectOptions("heal");
    expect(results.map((o) => o.label)).toEqual(["Heal", "Heal Corruption", "Heal per Condition"]);
  });

  it("returns empty array when nothing matches", () => {
    expect(filterEffectOptions("zzz")).toEqual([]);
  });
});

describe("filterPresetAnimations", () => {
  it("returns all keys for empty query", () => {
    expect(filterPresetAnimations("").length).toBe(PREDEFINED_ANIMATION_KEYS.length);
  });

  it("returns all keys for whitespace-only query", () => {
    expect(filterPresetAnimations("   ").length).toBe(PREDEFINED_ANIMATION_KEYS.length);
  });

  it("filters case-insensitively by key name", () => {
    const results = filterPresetAnimations("attack");
    expect(results).toEqual(["melee_attack", "range_attack", "magic_attack", "bare_hand_attack"]);
  });

  it("returns empty array when nothing matches", () => {
    expect(filterPresetAnimations("zzz")).toEqual([]);
  });
});
