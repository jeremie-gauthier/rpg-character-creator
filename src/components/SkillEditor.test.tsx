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
