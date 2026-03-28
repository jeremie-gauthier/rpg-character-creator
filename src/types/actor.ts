export interface FrameEvent {
  type: "play_audio";
  audioId: "footstep" | "door" | "chest" | "chest_close" | "ui_click" | "sword_attack" | "hurt";
}

export interface AnimationDefinition {
  columnIdx: number;
  frameDurationMs: number;
  frameEvents?: FrameEvent[];
}

export type AoeShape = "diamond" | "square" | "circle" | "cross" | "diagonal";

export type SideEffect =
  | {
      type: "damage-target";
      damageMin: number;
      damageMax: number;
      radius?: number;
      minRadius?: number;
      shape?: AoeShape;
      animation?: AnimationDefinition[];
      loop?: boolean;
    }
  | {
      type: "heal-target";
      healMin: number;
      healMax: number;
      radius?: number;
      minRadius?: number;
      shape?: AoeShape;
      animation?: AnimationDefinition[];
      loop?: boolean;
    }
  | { type: "charge-target" }
  | { type: "pull-target" }
  | {
      type: "push-target";
      pushForce: number;
    }
  | {
      type: "corrupt-target";
      corruptionMin: number;
      corruptionMax: number;
      radius?: number;
      minRadius?: number;
      shape?: AoeShape;
    }
  | {
      type: "apply-condition";
      condition: ConditionJson;
      radius?: number;
      minRadius?: number;
      shape?: AoeShape;
      animation?: AnimationDefinition[];
      loop?: boolean;
    };

export type ConditionJson =
  | {
      name: "damageReduction";
      durationMax: number;
    }
  | {
      name: "damageAugmentation";
      durationMax: number;
    }
  | {
      name: "defensiveStance";
      durationMax: number;
      reactionSkill?: ReactionSkillJson;
    }
  | {
      name: "offensiveStance";
      durationMax: number;
      reactionSkill?: ReactionSkillJson;
    };

export interface ReactionSkillJson {
  id: string;
  name: string;
  reactsTo: "enemies" | "allies" | "all";
  constraints?: SkillConstraint[];
  sideEffects: SideEffect[];
}

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
  | {
      type: "cast";
      minRange: number;
      maxRange: number;
      shape?: AoeShape;
      hasLineOfSight?: boolean;
    }
  | {
      type: "cooldown";
      turns: number;
    }
  | {
      type: "usagePerTurn";
      max: number;
    };

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
