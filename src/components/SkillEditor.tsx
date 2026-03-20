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
  FrameEvent,
} from "@/types/actor";
import { ChevronDown, Trash2, Plus } from "lucide-react";
import { useState } from "react";

const AUDIO_IDS = ["footstep", "door", "chest", "chest_close", "ui_click", "sword_attack", "hurt"] as const;

interface SkillEditorProps {
  skill: Skill;
  onChange: (skill: Skill) => void;
  onDelete: () => void;
}

export function SkillEditor({ skill, onChange, onDelete }: SkillEditorProps) {
  const [open, setOpen] = useState(true);

  const update = (partial: Partial<Skill>) => onChange({ ...skill, ...partial });

  return (
    <Card className="border-border">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? "" : "-rotate-90"}`} />
              <CardTitle className="text-base">{skill.name || "Unnamed Skill"}</CardTitle>
            </CollapsibleTrigger>
            <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label>ID</Label>
                <Input value={skill.id} onChange={(e) => update({ id: e.target.value })} placeholder="skill-id" />
              </div>
              <div>
                <Label>Name</Label>
                <Input value={skill.name} onChange={(e) => update({ name: e.target.value })} placeholder="Skill Name" />
              </div>
              <div>
                <Label>Icon Path</Label>
                <Input value={skill.icon} onChange={(e) => update({ icon: e.target.value })} placeholder="/path/to/icon.png" />
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
                  <Button size="sm" variant="outline" onClick={() => update({ requirements: [...skill.requirements, { type: "sanity_form", expectedForm: "PURE" }] })}>
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
                  <Button size="sm" variant="outline" onClick={() => update({ constraints: [...skill.constraints, { type: "range", minRange: 0, maxRange: 1 }] })}>
                    <Plus className="h-3 w-3 mr-1" /> Range
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => update({ constraints: [...skill.constraints, { type: "cast", isInLine: false }] })}>
                    <Plus className="h-3 w-3 mr-1" /> Cast
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => update({ constraints: [...skill.constraints, { type: "line_of_sight", hasLineOfSight: true }] })}>
                    <Plus className="h-3 w-3 mr-1" /> LoS
                  </Button>
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
                  <Button size="sm" variant="outline" onClick={() => update({ sideEffects: [...skill.sideEffects, { type: "damage-target", damageMin: 0, damageMax: 1 }] })}>
                    <Plus className="h-3 w-3 mr-1" /> Damage
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => update({ sideEffects: [...skill.sideEffects, { type: "charge-target" }] })}>
                    <Plus className="h-3 w-3 mr-1" /> Charge
                  </Button>
                </div>
              </div>
              {skill.sideEffects.map((se, si) => (
                <SideEffectRow key={si} effect={se} onChange={(v) => { const a = [...skill.sideEffects]; a[si] = v; update({ sideEffects: a }); }} onDelete={() => update({ sideEffects: skill.sideEffects.filter((_, i) => i !== si) })} />
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
  return (
    <div className="flex items-center gap-2 bg-muted rounded-md p-2">
      <span className="text-xs font-medium text-muted-foreground w-24 shrink-0">{constraint.type}</span>
      {constraint.type === "range" ? (
        <>
          <Label className="text-xs">Min</Label>
          <Input type="number" className="h-8 w-16" value={constraint.minRange} onChange={(e) => onChange({ ...constraint, minRange: parseInt(e.target.value) || 0 })} />
          <Label className="text-xs">Max</Label>
          <Input type="number" className="h-8 w-16" value={constraint.maxRange} onChange={(e) => onChange({ ...constraint, maxRange: parseInt(e.target.value) || 0 })} />
        </>
      ) : constraint.type === "cast" ? (
        <div className="flex items-center gap-2">
          <Checkbox checked={constraint.isInLine} onCheckedChange={(v) => onChange({ ...constraint, isInLine: !!v })} />
          <Label className="text-xs">In Line</Label>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Checkbox checked={constraint.hasLineOfSight} onCheckedChange={(v) => onChange({ ...constraint, hasLineOfSight: !!v })} />
          <Label className="text-xs">Has LoS</Label>
        </div>
      )}
      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 ml-auto" onClick={onDelete}><Trash2 className="h-3 w-3" /></Button>
    </div>
  );
}

function SideEffectRow({ effect, onChange, onDelete }: { effect: SideEffect; onChange: (e: SideEffect) => void; onDelete: () => void }) {
  if (effect.type === "charge-target") {
    return (
      <div className="flex items-center gap-2 bg-muted rounded-md p-2">
        <span className="text-xs font-medium text-muted-foreground">charge-target</span>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 ml-auto" onClick={onDelete}><Trash2 className="h-3 w-3" /></Button>
      </div>
    );
  }

  return (
    <div className="bg-muted rounded-md p-2 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground w-24 shrink-0">damage-target</span>
        <Label className="text-xs">Min</Label>
        <Input type="number" className="h-8 w-16" value={effect.damageMin} onChange={(e) => onChange({ ...effect, damageMin: parseInt(e.target.value) || 0 })} />
        <Label className="text-xs">Max</Label>
        <Input type="number" className="h-8 w-16" value={effect.damageMax} onChange={(e) => onChange({ ...effect, damageMax: parseInt(e.target.value) || 0 })} />
        <div className="flex items-center gap-1">
          <Checkbox checked={!!effect.loop} onCheckedChange={(v) => onChange({ ...effect, loop: !!v })} />
          <Label className="text-xs">Loop</Label>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 ml-auto" onClick={onDelete}><Trash2 className="h-3 w-3" /></Button>
      </div>

      {/* Animation frames */}
      <div className="pl-4 space-y-1">
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
