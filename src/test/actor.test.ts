import { describe, it, expect } from "vitest";
import { createDefaultActor, createDefaultSkill } from "@/types/actor";

describe("Actor types", () => {
  it("should create a default actor", () => {
    const actor = createDefaultActor();
    expect(actor.healthPointsMax).toBe(1);
    expect(actor.actionPointsMax).toBe(0);
    expect(actor.skills).toEqual([]);
  });

  it("should create a default skill", () => {
    const skill = createDefaultSkill();
    expect(skill.name).toBe("");
    expect(skill.sideEffects).toEqual([]);
  });
});
