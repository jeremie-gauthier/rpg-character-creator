export type FrameEvent =
  | {
      type: "play_audio";
      audioId:
        | "footstep"
        | "door"
        | "chest"
        | "chest_close"
        | "ui_click"
        | "sword_attack"
        | "hurt"
        | "fireball"
        | "fire_explosion"
        | "wildfire";
    }
  | { type: "launch_projectile" }
  | { type: "target_hurt" };

export interface AnimationDefinition {
  columnIdx: number;
  frameDurationMs: number;
  frameEvents?: FrameEvent[];
}

export interface ProjectileJsonDefinition {
  sheetPath: string;
  frameWidth: number;
  frameHeight: number;
  frames: AnimationDefinition[];
  travelDurationMs: number;
  loop?: boolean;
}

export interface TileAnimationJsonDefinition {
  sheetPath: string;
  frameWidth: number;
  frameHeight: number;
  frames: AnimationDefinition[];
}

export type Subject = "caster" | "target";

export type ConditionName =
  | "damageReduction"
  | "damageAugmentation"
  | "defensiveStance"
  | "offensiveStance"
  | "bleeding"
  | "burning";

export type AoeShape = "diamond" | "square" | "circle" | "cross" | "diagonal";

export type SideEffect =
  | {
      type: "apply-damage";
      subject: Subject;
      damageMin: number;
      damageMax: number;
      radius?: number;
      minRadius?: number;
      shape?: "diamond" | "square" | "circle" | "cross";
      animation?: AnimationDefinition[];
      loop?: boolean;
      projectile?: ProjectileJsonDefinition;
      tileAnimation?: TileAnimationJsonDefinition;
    }
  | {
      type: "apply-heal";
      subject: Subject;
      healMin: number;
      healMax: number;
      radius?: number;
      minRadius?: number;
      shape?: "diamond" | "square" | "circle" | "cross";
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
      type: "apply-corruption";
      subject: Subject;
      corruptionMin: number;
      corruptionMax: number;
      radius?: number;
      minRadius?: number;
      shape?: "diamond" | "square" | "circle" | "cross";
      animation?: AnimationDefinition[];
      loop?: boolean;
    }
  | {
      type: "apply-heal-corruption";
      subject: Subject;
      healMin: number;
      healMax: number;
      radius?: number;
      minRadius?: number;
      shape?: AoeShape;
      animation?: AnimationDefinition[];
      loop?: boolean;
    }
  | {
      type: "apply-condition";
      subject: Subject;
      condition: ConditionJson;
      radius?: number;
      minRadius?: number;
      shape?: AoeShape;
      animation?: AnimationDefinition[];
      loop?: boolean;
    }
  | {
      type: "apply-condition-cleanse";
      subject: Subject;
      conditionCleaner: "all" | ConditionName[];
      radius?: number;
      minRadius?: number;
      shape?: AoeShape;
      animation?: AnimationDefinition[];
      loop?: boolean;
    }
  | {
      type: "apply-damage-per-condition";
      subject: Subject;
      conditionName: ConditionName;
      damagePerStack: number;
      radius?: number;
      minRadius?: number;
      shape?: AoeShape;
      animation?: AnimationDefinition[];
      loop?: boolean;
      projectile?: ProjectileJsonDefinition;
      tileAnimation?: TileAnimationJsonDefinition;
    }
  | {
      type: "apply-heal-per-condition";
      subject: Subject;
      conditionName: ConditionName;
      healPerStack: number;
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
    }
  | {
      name: "bleeding";
      durationMax: number;
    }
  | {
      name: "burning";
      durationMax: number;
    };

export interface ReactionSkillJson {
  id: string;
  name: string;
  reactsTo: "allies" | "enemies" | "all";
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
