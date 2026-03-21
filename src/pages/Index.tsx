import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkillEditor } from "@/components/SkillEditor";
import { SpriteSheetViewer } from "@/components/SpriteSheetViewer";
import { createDefaultActor, createDefaultSkill, type Actor } from "@/types/actor";
import { Download, Upload, Plus } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [actor, setActor] = useState<Actor>(createDefaultActor());
  const fileRef = useRef<HTMLInputElement>(null);

  const updateActor = (partial: Partial<Actor>) => setActor((a) => ({ ...a, ...partial }));

  const exportJson = () => {
    if (!actor.race || !actor.job || !actor.spriteSheet) {
      toast.error("Race, Job, and Sprite Sheet are required.");
      return;
    }
    if (actor.healthPointsMax < 1) {
      toast.error("Health Points Max must be at least 1.");
      return;
    }
    // Clean up: remove empty animation arrays
    const clean = {
      ...actor,
      skills: actor.skills.map((s) => ({
        ...s,
        sideEffects: s.sideEffects.map((se) => {
          if (se.type === "damage-target") {
            const { animation, ...rest } = se;
            const cleaned: any = rest;
            if (animation && animation.length > 0) {
              cleaned.animation = animation.map((a) => {
                if (a.frameEvents && a.frameEvents.length === 0) {
                  const { frameEvents, ...aRest } = a;
                  return aRest;
                }
                return a;
              });
            }
            if (se.loop === false || se.loop === undefined) delete cleaned.loop;
            return cleaned;
          }
          return se;
        }),
      })),
    };

    const blob = new Blob([JSON.stringify(clean, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${actor.race.toLowerCase()}-${actor.job.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON exported!");
  };

  const loadJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as Actor;
        setActor(data);
        toast.success("Actor loaded!");
      } catch {
        toast.error("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground tracking-tight">RPG Actor Builder</h1>
          <div className="flex gap-2">
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={loadJson} />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4 mr-1" /> Load JSON
            </Button>
            <Button size="sm" onClick={exportJson}>
              <Download className="h-4 w-4 mr-1" /> Export JSON
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Actor Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Race</Label>
                <Input value={actor.race} onChange={(e) => updateActor({ race: e.target.value })} placeholder="HUMAN" />
              </div>
              <div>
                <Label>Job</Label>
                <Input value={actor.job} onChange={(e) => updateActor({ job: e.target.value })} placeholder="WARRIOR" />
              </div>
            </div>
            <div>
              <Label>Sprite Sheet Path</Label>
              <Input value={actor.spriteSheet} onChange={(e) => updateActor({ spriteSheet: e.target.value })} placeholder="/actors/heroes/warrior/warrior.png" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Health Points Max</Label>
                <Input type="number" min={1} value={actor.healthPointsMax} onChange={(e) => updateActor({ healthPointsMax: Math.max(1, parseInt(e.target.value) || 1) })} />
              </div>
              <div>
                <Label>Action Points Max</Label>
                <Input type="number" min={0} value={actor.actionPointsMax} onChange={(e) => updateActor({ actionPointsMax: Math.max(0, parseInt(e.target.value) || 0) })} />
              </div>
            </div>
            {/* Sprite Sheet Preview */}
            <SpriteSheetViewer src={actor.spriteSheet} label="Sprite Sheet Preview" />
          </CardContent>

        {/* Skills */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Skills</h2>
            <Button size="sm" onClick={() => updateActor({ skills: [...actor.skills, createDefaultSkill()] })}>
              <Plus className="h-4 w-4 mr-1" /> Add Skill
            </Button>
          </div>
          {actor.skills.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">No skills yet. Add one to get started.</p>
          )}
          {actor.skills.map((skill, i) => (
            <SkillEditor
              key={i}
              skill={skill}
              actorRace={actor.race}
              actorJob={actor.job}
              spriteSheet={actor.spriteSheet}
              onChange={(s) => {
                const skills = [...actor.skills];
                skills[i] = s;
                updateActor({ skills });
              }}
              onDelete={() => updateActor({ skills: actor.skills.filter((_, si) => si !== i) })}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
