export interface FrameEvent {
  type: "play_audio";
  audioId: "footstep" | "door" | "chest" | "chest_close" | "ui_click" | "sword_attack" | "hurt";
}

export interface AnimationDefinition {
  columnIdx: number;
  frameDurationMs: number;
  frameEvents?: FrameEvent[];
}

export type SideEffect =
  | {
      type: "damage-target";
      damageMin: number;
      damageMax: number;
      radius: number;
      animation?: AnimationDefinition[];
      loop?: boolean;
    }
  | { type: "charge-target" }
  | { type: "pull-target" };

export type SkillRequirement =
  | {
      type: "resource_cost";
      resource: "ACTION_POINTS" | "HEALTH_POINTS" | "CORRUPTION_POINTS";
      amount: number;
    }
  | {
      type: "sanity_form";
      expectedForm: "PURE" | "CORRUPTED";
    };

export type SkillConstraint =
  | { type: "range"; minRange: number; maxRange: number }
  | { type: "cast"; isInLine: boolean }
  | { type: "line_of_sight"; hasLineOfSight: boolean };

export interface Skill {
  id: string;
  name: string;
  icon: string;
  requirements: SkillRequirement[];
  constraints: SkillConstraint[];
  sideEffects: SideEffect[];
}

export interface Actor {
  race: string;
  job: string;
  healthPointsMax: number;
  actionPointsMax: number;
  spriteSheet: string;
  skills: Skill[];
}

export function createDefaultSkill(): Skill {
  return {
    id: "",
    name: "",
    icon: "",
    requirements: [],
    constraints: [],
    sideEffects: [],
  };
}

export function createDefaultActor(): Actor {
  return {
    race: "",
    job: "",
    healthPointsMax: 1,
    actionPointsMax: 0,
    spriteSheet: "",
    skills: [],
  };
}
