import type { Skill } from "@/types/actor";
import { useEffect, useState } from "react";

function generateSkillId(race: string, job: string, name: string): string {
  const slugify = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  return `${slugify(race)}-${slugify(job)}-${slugify(name)}`;
}

export function useSkillEditor({
  skill,
  actorRace,
  actorJob,
  onChange,
  defaultOpen,
}: {
  skill: Skill;
  actorRace: string;
  actorJob: string;
  onChange: (skill: Skill) => void;
  defaultOpen: boolean;
}) {
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

  return { open, setOpen, update };
}
