export const SKILL_IDS = [
  'js-basics',
  'react-hooks',
  'typescript',
  'css-layout',
  'algorithms',
  'sql',
  'git',
  'system-design',
] as const;

export type SkillId = (typeof SKILL_IDS)[number];
