import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type {
  Skill,
  SkillRequirement,
  SkillConstraint,
  SideEffect,
  AnimationDefinition,
  AoeShape,
  ConditionJson,
} from "@/types/actor";
import { ChevronDown, Trash2, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { ImagePlus } from "lucide-react";
import { IconPreview } from "./SpriteSheetViewer";
import { AnimationPreview } from "./AnimationPreview";
import { AoePreview } from "./AoePreview";

const AUDIO_IDS = ["footstep", "door", "chest", "chest_close", "ui_click", "sword_attack", "hurt"] as const;
const AOE_SHAPES: AoeShape[] = ["diamond", "square", "circle", "cross", "diagonal"];
const AOE_SHAPES_NO_DIAGONAL: AoeShape[] = ["diamond", "square", "circle", "cross"];

interface SkillEditorProps {
  skill: Skill;
  actorRace: string;
  actorJob: string;
  spriteSheet: string;
  resolveImage: (path: string) => string;
  onUploadImage: (pathKey: string, onPath?: (path: string) => void) => void;
  onChange: (skill: Skill) => void;
  onDelete: () => void;
  defaultOpen?: boolean;
}

function generateSkillId(race: string, job: string, name: string): string {
  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${slugify(race)}-${slugify(job)}-${slugify(name)}`;
}

export function SkillEditor({ skill, actorRace, actorJob, spriteSheet, resolveImage, onUploadImage, onChange, onDelete, defaultOpen = true }: SkillEditorProps) {
  const [open, setOpen] = useState(defaultOpen);

  const update = (partial: Partial<Skill>) => {
    const merged = { ...skill, ...partial };
    if ("name" in partial) {
      merged.id = generateSkillId(actorRace, actorJob, merged.name);
    }
    onChange(merged);
  };

  useEffect(() => {
    const newId = generateSkillId(actorRace, actorJob, skill.name);
    if (newId !== skill.id && skill.name) {
      onChange({ ...skill, id: newId });
    }
  }, [actorRace, actorJob]);

  const hasSanityReq = skill.requirements.some((r) => r.type === "sanity_form");
  const hasConstraint = skill.constraints.length > 0;

  const sanityReq = skill.requirements.find((r) => r.type === "sanity_form") as Extract<SkillRequirement, { type: "sanity_form" }> | undefined;
  const cardBorderColor = sanityReq ? "border-l-4" : "";
  const cardBorderStyle = sanityReq
    ? sanityReq.expectedForm === "PURE"
      ? { borderLeftColor: "#B84F4C" }
      : { borderLeftColor: "#827490" }
    : {};

  return (
    <Card className={`border-border ${cardBorderColor}`} style={cardBorderStyle}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? "" : "-rotate-90"}`} />
              <CardTitle className="text-base">{skill.name || "Unnamed Skill"}</CardTitle>
            </CollapsibleTrigger>
            <div className="flex items-center gap-2">
              <IconPreview src={resolveImage(skill.icon)} />
              <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label>ID (auto)</Label>
                <Input value={skill.id} readOnly className="bg-muted text-muted-foreground" />
              </div>
              <div>
                <Label>Name</Label>
                <Input value={skill.name} onChange={(e) => update({ name: e.target.value })} placeholder="Skill Name" />
              </div>
              <div>
                <Label>Icon Path</Label>
                <div className="flex gap-1">
                  <Input value={skill.icon} onChange={(e) => update({ icon: e.target.value })} placeholder="/path/to/icon.png" className="flex-1" />
                  <Button variant="outline" size="sm" className="h-9 px-2" onClick={() => onUploadImage(skill.icon, (path) => { if (!skill.icon) update({ icon: path }); })}>
                    <ImagePlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">Requirements</h4>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => update({ requirements: [...skill.requirements, { type: "resource_cost", resource: "ACTION_POINTS", amount: 1 }] })}>
                    <Plus className="h-3 w-3 mr-1" /> Resource
                  </Button>
                  <Button size="sm" variant="outline" disabled={hasSanityReq} onClick={() => update({ requirements: [...skill.requirements, { type: "sanity_form", expectedForm: "PURE" }] })}>
                    <Plus className="h-3 w-3 mr-1" /> Sanity
                  </Button>
                </div>
              </div>
              {skill.requirements.map((req, ri) => (
                <RequirementRow key={ri} req={req} onChange={(r) => { const a = [...skill.requirements]; a[ri] = r; update({ requirements: a }); }} onDelete={() => update({ requirements: skill.requirements.filter((_, i) => i !== ri) })} />
              ))}
            </section>

            {/* Constraints */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">Constraints</h4>
                <div className="flex gap-1">
                  {!skill.constraints.some(c => c.type === "cast") && (
                    <Button size="sm" variant="outline" onClick={() => update({ constraints: [...skill.constraints, { type: "cast", minRange: 0, maxRange: 1 }] })}>
                      <Plus className="h-3 w-3 mr-1" /> Cast
                    </Button>
                  )}
                  {!skill.constraints.some(c => c.type === "cooldown") && (
                    <Button size="sm" variant="outline" onClick={() => update({ constraints: [...skill.constraints, { type: "cooldown", turns: 1 }] })}>
                      <Plus className="h-3 w-3 mr-1" /> Cooldown
                    </Button>
                  )}
                </div>
              </div>
              {skill.constraints.map((c, ci) => (
                <ConstraintRow key={ci} constraint={c} onChange={(v) => { const a = [...skill.constraints]; a[ci] = v; update({ constraints: a }); }} onDelete={() => update({ constraints: skill.constraints.filter((_, i) => i !== ci) })} />
              ))}
            </section>

            {/* Side Effects */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">Side Effects</h4>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => update({ sideEffects: [...skill.sideEffects, { type: "damage-target", damageMin: 0, damageMax: 1, radius: 0, minRadius: 0, shape: "diamond" }] })}>
                    <Plus className="h-3 w-3 mr-1" /> Damage
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => update({ sideEffects: [...skill.sideEffects, { type: "heal-target", healMin: 0, healMax: 1 }] })}>
                    <Plus className="h-3 w-3 mr-1" /> Heal
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => update({ sideEffects: [...skill.sideEffects, { type: "apply-condition", condition: { name: "damageReduction", durationMax: 1 } }] })}>
                    <Plus className="h-3 w-3 mr-1" /> Condition
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => update({ sideEffects: [...skill.sideEffects, { type: "charge-target" }] })}>
                    <Plus className="h-3 w-3 mr-1" /> Charge
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => update({ sideEffects: [...skill.sideEffects, { type: "pull-target" }] })}>
                    <Plus className="h-3 w-3 mr-1" /> Pull
                  </Button>
                </div>
              </div>
              {skill.sideEffects.map((se, si) => (
                <SideEffectRow key={si} effect={se} spriteSheet={spriteSheet} onChange={(v) => { const a = [...skill.sideEffects]; a[si] = v; update({ sideEffects: a }); }} onDelete={() => update({ sideEffects: skill.sideEffects.filter((_, i) => i !== si) })} />
              ))}
            </section>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function RequirementRow({ req, onChange, onDelete }: { req: SkillRequirement; onChange: (r: SkillRequirement) => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-2 bg-muted rounded-md p-2">
      <span className="text-xs font-medium text-muted-foreground w-24 shrink-0">{req.type === "resource_cost" ? "Resource" : "Sanity"}</span>
      {req.type === "resource_cost" ? (
        <>
          <Select value={req.resource} onValueChange={(v) => onChange({ ...req, resource: v as any })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTION_POINTS">AP</SelectItem>
              <SelectItem value="HEALTH_POINTS">HP</SelectItem>
              <SelectItem value="CORRUPTION_POINTS">CP</SelectItem>
            </SelectContent>
          </Select>
          <Input type="number" className="h-8 w-20" value={req.amount} onChange={(e) => onChange({ ...req, amount: parseInt(e.target.value) || 0 })} />
        </>
      ) : (
        <Select value={req.expectedForm} onValueChange={(v) => onChange({ ...req, expectedForm: v as any })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="PURE">PURE</SelectItem>
            <SelectItem value="CORRUPTED">CORRUPTED</SelectItem>
          </SelectContent>
        </Select>
      )}
      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onDelete}><Trash2 className="h-3 w-3" /></Button>
    </div>
  );
}

function ConstraintRow({ constraint, onChange, onDelete }: { constraint: SkillConstraint; onChange: (c: SkillConstraint) => void; onDelete: () => void }) {
  if (constraint.type === "cooldown") {
    return (
      <div className="flex items-center gap-2 bg-muted rounded-md p-2">
        <span className="text-xs font-medium text-muted-foreground w-16 shrink-0">cooldown</span>
        <Label className="text-xs">Turns</Label>
        <Input type="number" className="h-8 w-16" value={constraint.turns} onChange={(e) => onChange({ ...constraint, turns: parseInt(e.target.value) || 1 })} min={1} />
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 ml-auto" onClick={onDelete}><Trash2 className="h-3 w-3" /></Button>
      </div>
    );
  }

  const shape = constraint.shape || "diamond";
  const radius = constraint.maxRange;
  const minRadius = constraint.minRange;

  return (
    <div className="bg-muted rounded-md p-2 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground w-16 shrink-0">cast</span>
        <Label className="text-xs">Min</Label>
        <Input type="number" className="h-8 w-16" value={constraint.minRange} onChange={(e) => onChange({ ...constraint, minRange: parseInt(e.target.value) || 0 })} min={0} />
        <Label className="text-xs">Max</Label>
        <Input type="number" className="h-8 w-16" value={constraint.maxRange} onChange={(e) => onChange({ ...constraint, maxRange: parseInt(e.target.value) || 0 })} min={0} />
        <div className="flex items-center gap-1">
          <Checkbox checked={!!constraint.hasLineOfSight} onCheckedChange={(v) => onChange({ ...constraint, hasLineOfSight: !!v })} />
          <Label className="text-xs">LoS</Label>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 ml-auto" onClick={onDelete}><Trash2 className="h-3 w-3" /></Button>
      </div>

      {/* Shape & preview */}
      <div className="bg-background rounded p-3 space-y-2">
        <span className="text-xs font-semibold text-foreground">Range Shape</span>
        <div className="flex items-start gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-xs w-16 shrink-0">Shape</Label>
            <Select value={shape} onValueChange={(v) => onChange({ ...constraint, shape: v as AoeShape })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {AOE_SHAPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <AoePreview radius={radius} minRadius={minRadius} shape={shape} />
        </div>
      </div>
    </div>
  );
}

/** Shared AoE block for side effects that support radius/minRadius/shape */
function AoeBlock({ radius, minRadius, shape, shapes, onChange }: {
  radius: number;
  minRadius: number;
  shape: AoeShape;
  shapes: AoeShape[];
  onChange: (patch: { radius?: number; minRadius?: number; shape?: AoeShape }) => void;
}) {
  return (
    <div className="bg-background rounded p-3 space-y-2">
      <span className="text-xs font-semibold text-foreground">Area of Effect</span>
      <div className="flex items-start gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <Label className="text-xs w-16 shrink-0">Shape</Label>
            <Select value={shape} onValueChange={(v) => onChange({ shape: v as AoeShape })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {shapes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs w-16 shrink-0">Radius</Label>
            <Input type="number" className="h-8 w-20" value={radius} onChange={(e) => onChange({ radius: parseInt(e.target.value) || 0 })} min={0} />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs w-16 shrink-0">Min Radius</Label>
            <Input type="number" className="h-8 w-20" value={minRadius} onChange={(e) => onChange({ minRadius: parseInt(e.target.value) || 0 })} min={0} />
          </div>
        </div>
        {radius > 0 && (
          <AoePreview radius={radius} minRadius={minRadius} shape={shape} />
        )}
      </div>
    </div>
  );
}

function SideEffectRow({ effect, spriteSheet, onChange, onDelete }: { effect: SideEffect; spriteSheet: string; onChange: (e: SideEffect) => void; onDelete: () => void }) {
  if (effect.type === "charge-target" || effect.type === "pull-target") {
    return (
      <div className="flex items-center gap-2 bg-muted rounded-md p-2">
        <span className="text-xs font-medium text-muted-foreground">{effect.type}</span>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 ml-auto" onClick={onDelete}><Trash2 className="h-3 w-3" /></Button>
      </div>
    );
  }

  if (effect.type === "apply-condition") {
    const radius = effect.radius ?? 0;
    const minRadius = effect.minRadius ?? 0;
    const shape = effect.shape || "diamond";

    return (
      <div className="bg-muted rounded-md p-2 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground w-28 shrink-0">apply-condition</span>
          <Label className="text-xs">Condition</Label>
          <Select value={effect.condition.name} onValueChange={(v) => onChange({ ...effect, condition: { ...effect.condition, name: v as ConditionJson["name"] } })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="damageReduction">damageReduction</SelectItem>
            </SelectContent>
          </Select>
          <Label className="text-xs">Duration</Label>
          <Input type="number" className="h-8 w-16" value={effect.condition.durationMax} onChange={(e) => onChange({ ...effect, condition: { ...effect.condition, durationMax: parseInt(e.target.value) || 1 } })} min={1} />
          <div className="flex items-center gap-1">
            <Checkbox checked={!!effect.loop} onCheckedChange={(v) => onChange({ ...effect, loop: !!v })} />
            <Label className="text-xs">Loop</Label>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 ml-auto" onClick={onDelete}><Trash2 className="h-3 w-3" /></Button>
        </div>

        <AoeBlock
          radius={radius}
          minRadius={minRadius}
          shape={shape}
          shapes={AOE_SHAPES}
          onChange={(patch) => onChange({ ...effect, ...patch })}
        />

        {/* Animation frames */}
        <div className="pl-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Animation Frames</span>
            <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => onChange({ ...effect, animation: [...(effect.animation || []), { columnIdx: 0, frameDurationMs: 150 }] })}>
              <Plus className="h-3 w-3 mr-1" /> Frame
            </Button>
          </div>

          {(effect.animation || []).map((frame, fi) => (
            <AnimationFrameRow
              key={fi}
              frame={frame}
              onChange={(f) => {
                const anim = [...(effect.animation || [])];
                anim[fi] = f;
                onChange({ ...effect, animation: anim });
              }}
              onDelete={() => onChange({ ...effect, animation: (effect.animation || []).filter((_, i) => i !== fi) })}
            />
          ))}

          {(effect.animation || []).length > 0 && (
            <AnimationPreview
              spriteSheetSrc={spriteSheet}
              frames={effect.animation || []}
              loop={!!effect.loop}
            />
          )}
        </div>
      </div>
    );
  }

  // damage-target or heal-target
  const isDamage = effect.type === "damage-target";
  const label = isDamage ? "damage-target" : "heal-target";
  const valMin = isDamage ? effect.damageMin : effect.healMin;
  const valMax = isDamage ? effect.damageMax : effect.healMax;
  const radius = effect.radius ?? 0;
  const minRadius = effect.minRadius ?? 0;
  const shape = effect.shape || "diamond";

  const updateMinMax = (field: "min" | "max", val: number) => {
    if (isDamage) {
      onChange(field === "min" ? { ...effect, damageMin: val } : { ...effect, damageMax: val });
    } else {
      onChange(field === "min" ? { ...effect, healMin: val } : { ...effect, healMax: val });
    }
  };

  return (
    <div className="bg-muted rounded-md p-2 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground w-24 shrink-0">{label}</span>
        <Label className="text-xs">Min</Label>
        <Input type="number" className="h-8 w-16" value={valMin} onChange={(e) => updateMinMax("min", parseInt(e.target.value) || 0)} />
        <Label className="text-xs">Max</Label>
        <Input type="number" className="h-8 w-16" value={valMax} onChange={(e) => updateMinMax("max", parseInt(e.target.value) || 0)} />
        <div className="flex items-center gap-1">
          <Checkbox checked={!!effect.loop} onCheckedChange={(v) => onChange({ ...effect, loop: !!v })} />
          <Label className="text-xs">Loop</Label>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 ml-auto" onClick={onDelete}><Trash2 className="h-3 w-3" /></Button>
      </div>

      <AoeBlock
        radius={radius}
        minRadius={minRadius}
        shape={shape}
        shapes={AOE_SHAPES_NO_DIAGONAL}
        onChange={(patch) => onChange({ ...effect, ...patch })}
      />

      {/* Animation frames */}
      <div className="pl-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Animation Frames</span>
          <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => onChange({ ...effect, animation: [...(effect.animation || []), { columnIdx: 0, frameDurationMs: 150 }] })}>
            <Plus className="h-3 w-3 mr-1" /> Frame
          </Button>
        </div>

        {(effect.animation || []).map((frame, fi) => (
          <AnimationFrameRow
            key={fi}
            frame={frame}
            onChange={(f) => {
              const anim = [...(effect.animation || [])];
              anim[fi] = f;
              onChange({ ...effect, animation: anim });
            }}
            onDelete={() => onChange({ ...effect, animation: (effect.animation || []).filter((_, i) => i !== fi) })}
          />
        ))}

        {(effect.animation || []).length > 0 && (
          <AnimationPreview
            spriteSheetSrc={spriteSheet}
            frames={effect.animation || []}
            loop={!!effect.loop}
          />
        )}
      </div>
    </div>
  );
}

function AnimationFrameRow({ frame, onChange, onDelete }: { frame: AnimationDefinition; onChange: (f: AnimationDefinition) => void; onDelete: () => void }) {
  return (
    <div className="bg-background rounded p-2 space-y-1">
      <div className="flex items-center gap-2">
        <Label className="text-xs">Col</Label>
        <Input type="number" className="h-7 w-14 text-xs" value={frame.columnIdx} onChange={(e) => onChange({ ...frame, columnIdx: parseInt(e.target.value) || 0 })} />
        <Label className="text-xs">ms</Label>
        <Input type="number" className="h-7 w-16 text-xs" value={frame.frameDurationMs} onChange={(e) => onChange({ ...frame, frameDurationMs: parseInt(e.target.value) || 0 })} />
        <Button size="sm" variant="outline" className="h-6 text-xs ml-auto" onClick={() => onChange({ ...frame, frameEvents: [...(frame.frameEvents || []), { type: "play_audio", audioId: "footstep" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Event
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDelete}><Trash2 className="h-3 w-3" /></Button>
      </div>
      {(frame.frameEvents || []).map((ev, ei) => (
        <div key={ei} className="flex items-center gap-2 pl-4">
          <span className="text-xs text-muted-foreground">Audio:</span>
          <Select value={ev.audioId} onValueChange={(v) => {
            const events = [...(frame.frameEvents || [])];
            events[ei] = { ...ev, audioId: v as any };
            onChange({ ...frame, frameEvents: events });
          }}>
            <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {AUDIO_IDS.map((id) => <SelectItem key={id} value={id}>{id}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onChange({ ...frame, frameEvents: (frame.frameEvents || []).filter((_, i) => i !== ei) })}><Trash2 className="h-3 w-3" /></Button>
        </div>
      ))}
    </div>
  );
}
