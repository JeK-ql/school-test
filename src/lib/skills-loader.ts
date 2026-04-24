import type { Skill } from '@/types/skill';
import { SKILL_IDS, type SkillId } from '@/data/skills-manifest';

const cache = new Map<string, Skill>();

export async function loadSkill(id: SkillId): Promise<Skill> {
  if (cache.has(id)) return cache.get(id)!;
  const res = await fetch(`/skills/${id}.json`);
  if (!res.ok) throw new Error(`Skill "${id}" not found`);
  const data = (await res.json()) as Skill;
  cache.set(id, data);
  return data;
}

export function getSkillMetadata(): Array<Pick<Skill, 'skill_id' | 'skill_name' | 'difficulty'>> {
  return [
    { skill_id: 'js-basics', skill_name: 'JavaScript Fundamentals', difficulty: 'C-Rank' },
    { skill_id: 'react-hooks', skill_name: 'React Hooks & Logic', difficulty: 'B-Rank' },
    { skill_id: 'typescript', skill_name: 'TypeScript Essentials', difficulty: 'B-Rank' },
    { skill_id: 'css-layout', skill_name: 'CSS & Layout', difficulty: 'C-Rank' },
    { skill_id: 'algorithms', skill_name: 'Algorithms & Data Structures', difficulty: 'A-Rank' },
    { skill_id: 'sql', skill_name: 'SQL & Databases', difficulty: 'B-Rank' },
    { skill_id: 'git', skill_name: 'Git & Version Control', difficulty: 'C-Rank' },
    { skill_id: 'system-design', skill_name: 'System Design', difficulty: 'S-Rank' },
  ];
}

export { SKILL_IDS };
export type { SkillId };
