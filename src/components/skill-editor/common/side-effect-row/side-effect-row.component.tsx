import { AnimationFramesSection } from "@/components/skill-editor/common/animation-frames-section/animation-frames-section.component";
import { AoeBlock } from "@/components/skill-editor/common/aoe-block/aoe-block.component";
import { ReactionSkillBlock } from "@/components/skill-editor/common/reaction-skill-block/reaction-skill-block.component";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AOE_SHAPES,
  AOE_SHAPES_NO_DIAGONAL,
  CONDITION_NAMES,
} from "@/lib/skill-utils";
import type {
  AoeShape,
  ConditionJson,
  ConditionName,
  ReactionSkillJson,
  SideEffect,
} from "@/types/actor";
import { Trash2 } from "lucide-react";
import { ProjectileBlock } from "./projectile-block/projectile-block.component";
import { TileAnimationBlock } from "./tile-animation-block/tile-animation-block.component";

export function SideEffectRow({
  effect,
  spriteSheet,
  onUploadImage,
  resolveImage,
  onChange,
  onDelete,
}: {
  effect: SideEffect;
  spriteSheet: string;
  onUploadImage: (pathKey: string, onPath?: (path: string) => void) => void;
  resolveImage: (path: string) => string;
  onChange: (e: SideEffect) => void;
  onDelete: () => void;
}) {
  if (effect.type === "apply-condition-cleanse") {
    const radius = effect.radius ?? 0;
    const minRadius = effect.minRadius ?? 0;
    const shape = effect.shape || "diamond";

    return (
      <div className="bg-muted rounded-md p-2 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground w-28 shrink-0">
            apply-cleanse
          </span>
          <Select
            value={effect.subject}
            onValueChange={(v) =>
              onChange({ ...effect, subject: v as "target" | "caster" })
            }
          >
            <SelectTrigger className="h-8 text-xs w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="target">target</SelectItem>
              <SelectItem value="caster">caster</SelectItem>
            </SelectContent>
          </Select>
          <Label className="text-xs">Cleanse</Label>
          <Select
            value={effect.conditionCleaner === "all" ? "all" : "specific"}
            onValueChange={(v) =>
              onChange({
                ...effect,
                conditionCleaner: v === "all" ? "all" : [],
              })
            }
          >
            <SelectTrigger className="h-8 text-xs w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">all</SelectItem>
              <SelectItem value="specific">specific</SelectItem>
            </SelectContent>
          </Select>
          {effect.conditionCleaner !== "all" && (
            <div className="flex flex-wrap gap-1 mt-1">
              {CONDITION_NAMES.map((name) => (
                <div
                  key={name}
                  className="flex items-center gap-1 bg-background px-2 py-0.5 rounded border border-border"
                >
                  <Checkbox
                    id={`cleanse-${name}`}
                    checked={(
                      effect.conditionCleaner as ConditionName[]
                    ).includes(name)}
                    onCheckedChange={(checked) => {
                      const cleaner = [
                        ...(effect.conditionCleaner as ConditionName[]),
                      ];
                      if (checked) {
                        cleaner.push(name);
                      } else {
                        const idx = cleaner.indexOf(name);
                        if (idx > -1) cleaner.splice(idx, 1);
                      }
                      onChange({ ...effect, conditionCleaner: cleaner });
                    }}
                  />
                  <Label
                    htmlFor={`cleanse-${name}`}
                    className="text-[10px] leading-none cursor-pointer"
                  >
                    {name}
                  </Label>
                </div>
              ))}
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 ml-auto"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        <AoeBlock
          radius={radius}
          minRadius={minRadius}
          shape={shape}
          shapes={AOE_SHAPES}
          onChange={(patch) => onChange({ ...effect, ...patch })}
        />

        <AnimationFramesSection
          animation={effect.animation || []}
          loop={!!effect.loop}
          spriteSheet={spriteSheet}
          onChange={(patch) => onChange({ ...effect, ...patch })}
        />
      </div>
    );
  }

  if (effect.type === "charge-target" || effect.type === "pull-target") {
    return (
      <div className="flex items-center gap-2 bg-muted rounded-md p-2">
        <span className="text-xs font-medium text-muted-foreground">
          {effect.type}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 ml-auto"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  if (effect.type === "push-target") {
    return (
      <div className="flex items-center gap-2 bg-muted rounded-md p-2">
        <span className="text-xs font-medium text-muted-foreground w-24 shrink-0">
          push-target
        </span>
        <Label className="text-xs">Force</Label>
        <Input
          type="number"
          className="h-8 w-16"
          value={effect.pushForce}
          onChange={(e) =>
            onChange({ ...effect, pushForce: parseInt(e.target.value) || 1 })
          }
          min={1}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 ml-auto"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  if (effect.type === "apply-condition") {
    const radius = effect.radius ?? 0;
    const minRadius = effect.minRadius ?? 0;
    const shape = effect.shape || "diamond";

    return (
      <div className="bg-muted rounded-md p-2 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground w-28 shrink-0">
            apply-condition
          </span>
          <Select
            value={effect.subject}
            onValueChange={(v) =>
              onChange({ ...effect, subject: v as "target" | "caster" })
            }
          >
            <SelectTrigger className="h-8 text-xs w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="target">target</SelectItem>
              <SelectItem value="caster">caster</SelectItem>
            </SelectContent>
          </Select>
          <Label className="text-xs">Condition</Label>
          <Select
            value={effect.condition.name}
            onValueChange={(v) => {
              const dur = effect.condition.durationMax;
              const defaultRS: ReactionSkillJson = {
                id: "",
                name: "",
                reactsTo: "enemies",
                sideEffects: [],
              };

              if (v === "damageReduction") {
                onChange({
                  ...effect,
                  condition: { name: "damageReduction", durationMax: dur },
                });
              } else if (v === "damageAugmentation") {
                onChange({
                  ...effect,
                  condition: { name: "damageAugmentation", durationMax: dur },
                });
              } else if (v === "defensiveStance") {
                const prev =
                  effect.condition.name === "defensiveStance" ||
                  effect.condition.name === "offensiveStance"
                    ? effect.condition.reactionSkill
                    : defaultRS;
                onChange({
                  ...effect,
                  condition: {
                    name: "defensiveStance",
                    durationMax: dur,
                    reactionSkill: prev,
                  },
                });
              } else if (v === "offensiveStance") {
                const prev =
                  effect.condition.name === "defensiveStance" ||
                  effect.condition.name === "offensiveStance"
                    ? effect.condition.reactionSkill
                    : defaultRS;
                onChange({
                  ...effect,
                  condition: {
                    name: "offensiveStance",
                    durationMax: dur,
                    reactionSkill: prev,
                  },
                });
              } else if (v === "bleeding") {
                onChange({
                  ...effect,
                  condition: { name: "bleeding", durationMax: dur },
                });
              } else if (v === "burning") {
                onChange({
                  ...effect,
                  condition: { name: "burning", durationMax: dur },
                });
              }
            }}
          >
            <SelectTrigger className="h-8 text-xs w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="damageReduction">damageReduction</SelectItem>
              <SelectItem value="damageAugmentation">
                damageAugmentation
              </SelectItem>
              <SelectItem value="defensiveStance">defensiveStance</SelectItem>
              <SelectItem value="offensiveStance">offensiveStance</SelectItem>
              <SelectItem value="bleeding">bleeding</SelectItem>
              <SelectItem value="burning">burning</SelectItem>
            </SelectContent>
          </Select>
          <Label className="text-xs">Duration</Label>
          <Input
            type="number"
            className="h-8 w-16"
            value={effect.condition.durationMax}
            onChange={(e) =>
              onChange({
                ...effect,
                condition: {
                  ...effect.condition,
                  durationMax: parseInt(e.target.value) || 1,
                },
              })
            }
            min={1}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 ml-auto"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        {(effect.condition.name === "defensiveStance" ||
          effect.condition.name === "offensiveStance") && (
          <ReactionSkillBlock
            reactionSkill={
              (
                effect.condition as Extract<
                  ConditionJson,
                  { name: "defensiveStance" | "offensiveStance" }
                >
              ).reactionSkill
            }
            spriteSheet={spriteSheet}
            onUploadImage={onUploadImage}
            resolveImage={resolveImage}
            onChange={(rs) =>
              onChange({
                ...effect,
                condition: {
                  ...effect.condition,
                  reactionSkill: rs,
                } as ConditionJson,
              })
            }
          />
        )}

        <AoeBlock
          radius={radius}
          minRadius={minRadius}
          shape={shape}
          shapes={AOE_SHAPES}
          onChange={(patch) => onChange({ ...effect, ...patch })}
        />

        <AnimationFramesSection
          animation={effect.animation || []}
          loop={!!effect.loop}
          spriteSheet={spriteSheet}
          onChange={(patch) => onChange({ ...effect, ...patch })}
        />
      </div>
    );
  }

  if (effect.type === "apply-damage-per-condition") {
    const label = "apply-dmg/cond";
    const perStack = effect.damagePerStack;
    const radius = effect.radius ?? 0;
    const minRadius = effect.minRadius ?? 0;
    const shape = effect.shape || "diamond";

    return (
      <div className="bg-muted rounded-md p-2 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground w-28 shrink-0">
            {label}
          </span>
          <Select
            value={effect.subject}
            onValueChange={(v) =>
              onChange({ ...effect, subject: v as "target" | "caster" })
            }
          >
            <SelectTrigger className="h-8 text-xs w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="target">target</SelectItem>
              <SelectItem value="caster">caster</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={effect.conditionName}
            onValueChange={(v) =>
              onChange({ ...effect, conditionName: v as ConditionName })
            }
          >
            <SelectTrigger className="h-8 text-xs w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONDITION_NAMES.map((n) => (
                <SelectItem key={n} value={n}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Label className="text-xs">Dmg/stack</Label>
          <Input
            type="number"
            className="h-8 w-16"
            value={perStack}
            min={1}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              onChange({ ...effect, damagePerStack: val });
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 ml-auto"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        <AoeBlock
          radius={radius}
          minRadius={minRadius}
          shape={shape}
          shapes={AOE_SHAPES}
          onChange={(patch) => onChange({ ...effect, ...patch })}
        />
        <AnimationFramesSection
          animation={effect.animation || []}
          loop={!!effect.loop}
          spriteSheet={spriteSheet}
          onChange={(patch) => onChange({ ...effect, ...patch })}
        />
        <div className="space-y-2">
          <ProjectileBlock
            projectile={effect.projectile}
            onUploadImage={onUploadImage}
            onChange={(p) => onChange({ ...effect, projectile: p })}
            resolveImage={resolveImage}
          />
          <TileAnimationBlock
            animation={effect.tileAnimation}
            onUploadImage={onUploadImage}
            onChange={(a) => onChange({ ...effect, tileAnimation: a })}
            resolveImage={resolveImage}
          />
        </div>
      </div>
    );
  }

  if (effect.type === "apply-heal-per-condition") {
    const label = "apply-heal/cond";
    const perStack = effect.healPerStack;
    const radius = effect.radius ?? 0;
    const minRadius = effect.minRadius ?? 0;
    const shape = effect.shape || "diamond";

    return (
      <div className="bg-muted rounded-md p-2 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground w-28 shrink-0">
            {label}
          </span>
          <Select
            value={effect.subject}
            onValueChange={(v) =>
              onChange({ ...effect, subject: v as "target" | "caster" })
            }
          >
            <SelectTrigger className="h-8 text-xs w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="target">target</SelectItem>
              <SelectItem value="caster">caster</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={effect.conditionName}
            onValueChange={(v) =>
              onChange({ ...effect, conditionName: v as ConditionName })
            }
          >
            <SelectTrigger className="h-8 text-xs w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONDITION_NAMES.map((n) => (
                <SelectItem key={n} value={n}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Label className="text-xs">Heal/stack</Label>
          <Input
            type="number"
            className="h-8 w-16"
            value={perStack}
            min={1}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              onChange({ ...effect, healPerStack: val });
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 ml-auto"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        <AoeBlock
          radius={radius}
          minRadius={minRadius}
          shape={shape}
          shapes={AOE_SHAPES}
          onChange={(patch) => onChange({ ...effect, ...patch })}
        />
        <AnimationFramesSection
          animation={effect.animation || []}
          loop={!!effect.loop}
          spriteSheet={spriteSheet}
          onChange={(patch) => onChange({ ...effect, ...patch })}
        />
      </div>
    );
  }

  if (
    effect.type === "apply-corruption" ||
    effect.type === "apply-heal-corruption"
  ) {
    const isCorruption = effect.type === "apply-corruption";
    const label = isCorruption ? "apply-corruption" : "apply-heal-corruption";
    const valMin = isCorruption ? effect.corruptionMin : effect.healMin;
    const valMax = isCorruption ? effect.corruptionMax : effect.healMax;
    const radius = effect.radius ?? 0;
    const minRadius = effect.minRadius ?? 0;
    const shape = effect.shape || "diamond";

    const updateMinMax = (field: "min" | "max", val: number) => {
      if (isCorruption) {
        onChange(
          field === "min"
            ? { ...effect, corruptionMin: val }
            : { ...effect, corruptionMax: val },
        );
      } else {
        onChange(
          field === "min"
            ? { ...effect, healMin: val }
            : { ...effect, healMax: val },
        );
      }
    };

    return (
      <div className="bg-muted rounded-md p-2 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground w-28 shrink-0">
            {label}
          </span>
          <Select
            value={effect.subject}
            onValueChange={(v) =>
              onChange({ ...effect, subject: v as "target" | "caster" })
            }
          >
            <SelectTrigger className="h-8 text-xs w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="target">target</SelectItem>
              <SelectItem value="caster">caster</SelectItem>
            </SelectContent>
          </Select>
          <Label className="text-xs">Min</Label>
          <Input
            type="number"
            className="h-8 w-16"
            value={valMin}
            onChange={(e) =>
              updateMinMax("min", parseInt(e.target.value) || 0)
            }
          />
          <Label className="text-xs">Max</Label>
          <Input
            type="number"
            className="h-8 w-16"
            value={valMax}
            onChange={(e) =>
              updateMinMax("max", parseInt(e.target.value) || 0)
            }
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 ml-auto"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        <AoeBlock
          radius={radius}
          minRadius={minRadius}
          shape={shape}
          shapes={isCorruption ? AOE_SHAPES_NO_DIAGONAL : AOE_SHAPES}
          onChange={(patch) => onChange({ ...effect, ...patch })}
        />
        <AnimationFramesSection
          animation={effect.animation || []}
          loop={!!effect.loop}
          spriteSheet={spriteSheet}
          onChange={(patch) => onChange({ ...effect, ...patch })}
        />
      </div>
    );
  }

  // apply-damage or apply-heal (fallthrough)
  const isDamage = effect.type === "apply-damage";
  const label = isDamage ? "apply-damage" : "apply-heal";
  const valMin = isDamage ? effect.damageMin : effect.healMin;
  const valMax = isDamage ? effect.damageMax : effect.healMax;
  const radius = effect.radius ?? 0;
  const minRadius = effect.minRadius ?? 0;
  const shape = effect.shape || "diamond";

  const updateMinMax = (field: "min" | "max", val: number) => {
    if (isDamage) {
      onChange(
        field === "min"
          ? { ...effect, damageMin: val }
          : { ...effect, damageMax: val },
      );
    } else {
      onChange(
        field === "min"
          ? { ...effect, healMin: val }
          : { ...effect, healMax: val },
      );
    }
  };

  return (
    <div className="bg-muted rounded-md p-2 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground w-24 shrink-0">
          {label}
        </span>
        <Select
          value={effect.subject}
          onValueChange={(v) =>
            onChange({ ...effect, subject: v as "target" | "caster" })
          }
        >
          <SelectTrigger className="h-8 text-xs w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="target">target</SelectItem>
            <SelectItem value="caster">caster</SelectItem>
          </SelectContent>
        </Select>
        <Label className="text-xs">Min</Label>
        <Input
          type="number"
          className="h-8 w-16"
          value={valMin}
          onChange={(e) => updateMinMax("min", parseInt(e.target.value) || 0)}
        />
        <Label className="text-xs">Max</Label>
        <Input
          type="number"
          className="h-8 w-16"
          value={valMax}
          onChange={(e) => updateMinMax("max", parseInt(e.target.value) || 0)}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 ml-auto"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <AoeBlock
        radius={radius}
        minRadius={minRadius}
        shape={shape}
        shapes={AOE_SHAPES_NO_DIAGONAL}
        onChange={(patch) => onChange({ ...effect, ...patch })}
      />

      <AnimationFramesSection
        animation={effect.animation || []}
        loop={!!effect.loop}
        spriteSheet={spriteSheet}
        onChange={(patch) => onChange({ ...effect, ...patch })}
      />

      {isDamage && (
        <div className="space-y-2">
          <ProjectileBlock
            projectile={effect.projectile}
            onUploadImage={onUploadImage}
            onChange={(p) => onChange({ ...effect, projectile: p })}
            resolveImage={resolveImage}
          />
          <TileAnimationBlock
            animation={effect.tileAnimation}
            onUploadImage={onUploadImage}
            onChange={(a) => onChange({ ...effect, tileAnimation: a })}
            resolveImage={resolveImage}
          />
        </div>
      )}
    </div>
  );
}
