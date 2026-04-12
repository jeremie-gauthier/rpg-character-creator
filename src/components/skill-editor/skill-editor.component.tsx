import { IconPreview } from "@/components/SpriteSheetViewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Skill, SkillRequirement } from "@/types/actor";
import { ChevronDown, ImagePlus, Trash2 } from "lucide-react";
import { SkillConstraints } from "./skill-constraints/skill-constraints.component";
import { SkillRequirements } from "./skill-requirements/skill-requirements.component";
import { SkillSideEffects } from "./skill-side-effects/skill-side-effects.component";
import { useSkillEditor } from "./use-skill-editor.hook";

export interface SkillEditorProps {
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

export function SkillEditor({
  skill,
  actorRace,
  actorJob,
  spriteSheet,
  resolveImage,
  onUploadImage,
  onChange,
  onDelete,
  defaultOpen = true,
}: SkillEditorProps) {
  const { open, setOpen, update } = useSkillEditor({
    skill,
    actorRace,
    actorJob,
    onChange,
    defaultOpen,
  });

  const sanityReq = skill.requirements.find(
    (r) => r.type === "sanity_form",
  ) as Extract<SkillRequirement, { type: "sanity_form" }> | undefined;
  const cardBorderColor = sanityReq ? "border-l-4" : "";
  const cardBorderStyle = sanityReq
    ? sanityReq.expectedForm === "PURE"
      ? { borderLeftColor: "#B84F4C" }
      : { borderLeftColor: "#827490" }
    : {};

  return (
    <Card
      className={`border-border ${cardBorderColor}`}
      style={cardBorderStyle}
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <ChevronDown
                className={`h-4 w-4 transition-transform ${open ? "" : "-rotate-90"}`}
              />
              <CardTitle className="text-base">
                {skill.name || "Unnamed Skill"}
              </CardTitle>
            </CollapsibleTrigger>
            <div className="flex items-center gap-2">
              <IconPreview src={resolveImage(skill.icon)} />
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-8 w-8 text-destructive"
              >
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
                <Input
                  value={skill.id}
                  readOnly
                  className="bg-muted text-muted-foreground"
                />
              </div>
              <div>
                <Label>Name</Label>
                <Input
                  value={skill.name}
                  onChange={(e) => update({ name: e.target.value })}
                  placeholder="Skill Name"
                />
              </div>
              <div>
                <Label>Icon Path</Label>
                <div className="flex gap-1">
                  <Input
                    value={skill.icon}
                    onChange={(e) => update({ icon: e.target.value })}
                    placeholder="/path/to/icon.png"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-2"
                    onClick={() =>
                      onUploadImage(skill.icon, (path) => {
                        if (!skill.icon) update({ icon: path });
                      })
                    }
                  >
                    <ImagePlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <SkillRequirements
              requirements={skill.requirements}
              onChange={(requirements) => update({ requirements })}
            />

            <SkillConstraints
              constraints={skill.constraints}
              onChange={(constraints) => update({ constraints })}
            />

            <SkillSideEffects
              sideEffects={skill.sideEffects}
              spriteSheet={spriteSheet}
              resolveImage={resolveImage}
              onUploadImage={onUploadImage}
              onChange={(sideEffects) => update({ sideEffects })}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
