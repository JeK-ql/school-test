# Shadow Leveling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Solo Leveling-themed Next.js web app for skill testing with NextAuth/MongoDB auth, gamified XP/level progression, timer-based runs, and daily-changing neon theme.

**Architecture:** Single Next.js 15 App Router monolith on Vercel. Client-side question randomization from local JSON files. MongoDB Atlas for users/progress/runs via official driver (no Mongoose). Zustand for in-run state with sessionStorage persistence. NextAuth v5 Credentials Provider with JWT session strategy.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, MongoDB Atlas, NextAuth.js v5, Zustand, Zod, Vitest, Playwright, bcrypt.

**Spec:** `docs/superpowers/specs/2026-04-25-shadow-leveling-design.md`

---

## File Structure

```
/src
  /app
    layout.tsx                         root layout + ThemeProvider mount
    globals.css                        CSS vars + neon utilities
    page.tsx                           landing redirect
    /(auth)/login/page.tsx
    /(auth)/register/page.tsx
    /(app)/layout.tsx                  protected layout + navbar
    /(app)/dashboard/page.tsx          Server Component
    /(app)/test/[skillId]/page.tsx     Client Runner
    /api/auth/[...nextauth]/route.ts
    /api/auth/register/route.ts
    /api/runs/route.ts
    /api/progress/route.ts
  /components
    /ui
      NeonButton.tsx
      NeonCard.tsx
      HexBadge.tsx
      ProgressBar.tsx
      ProgressDots.tsx
      SystemModal.tsx
      Icon.tsx
    /dashboard
      SkillCard.tsx
      DifficultyModal.tsx
    /test
      TestRunner.tsx
      Timer.tsx
      AnswerGrid.tsx
      NoCorrectButton.tsx
      PenaltyOverlay.tsx
      LevelUpOverlay.tsx
      ExplanationPanel.tsx
    ThemeProvider.tsx
  /data
    /skills/*.json                     8 files moved from /question/
    icons-registry.json
  /lib
    mongo.ts
    auth.ts
    level.ts
    shuffle.ts
    randomize.ts
    theme.ts
    validate-skills.ts
    skills-loader.ts
  /store
    useRunStore.ts
  /types
    skill.ts, run.ts, progress.ts, user.ts, session.ts
  middleware.ts
/scripts
  validate-skills.ts
/tests
  /unit/{level,shuffle,randomize}.test.ts
  /integration/{runs-api,register-api}.test.ts
  /e2e/smoke.spec.ts
/.github/workflows/ci.yml
```

---

## Task 1: Bootstrap Next.js 15 project with TypeScript + Tailwind

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `.env.example`, `README.md`

- [ ] **Step 1: Initialize package.json**

Create `package.json`:

```json
{
  "name": "shadow-leveling",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "validate:skills": "tsx scripts/validate-skills.ts"
  },
  "dependencies": {
    "next": "15.1.0",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "next-auth": "5.0.0-beta.25",
    "mongodb": "6.12.0",
    "bcryptjs": "2.4.3",
    "zustand": "5.0.2",
    "zod": "3.24.1"
  },
  "devDependencies": {
    "@types/node": "22.10.2",
    "@types/react": "19.0.2",
    "@types/react-dom": "19.0.2",
    "@types/bcryptjs": "2.4.6",
    "typescript": "5.7.2",
    "tailwindcss": "3.4.17",
    "postcss": "8.4.49",
    "autoprefixer": "10.4.20",
    "eslint": "9.17.0",
    "eslint-config-next": "15.1.0",
    "vitest": "2.1.8",
    "@vitest/ui": "2.1.8",
    "happy-dom": "15.11.7",
    "mongodb-memory-server": "10.1.2",
    "@playwright/test": "1.49.1",
    "tsx": "4.19.2"
  }
}
```

- [ ] **Step 2: Add tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Add next.config.mjs + tailwind + postcss configs**

`next.config.mjs`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = { reactStrictMode: true };
export default nextConfig;
```

`tailwind.config.ts`:
```ts
import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        surface: '#111216',
        text: '#E6F7EE',
        muted: '#7a8b82',
        accent: 'var(--accent-color)',
        danger: '#FF005C',
      },
      fontFamily: { mono: ['ui-monospace', 'monospace'] },
      boxShadow: { glow: '0 0 14px var(--accent-color)' },
    },
  },
  plugins: [],
};
export default config;
```

`postcss.config.mjs`:
```js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

- [ ] **Step 4: Add .env.example and .gitignore updates**

`.env.example`:
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/shadow-leveling
AUTH_SECRET=generate-with-openssl-rand-base64-32
AUTH_URL=http://localhost:3000
```

Append to existing `.gitignore`:
```
/coverage
/test-results
/playwright-report
/tsconfig.tsbuildinfo
/next-env.d.ts
```

- [ ] **Step 5: Install and verify**

Run: `npm install`
Expected: no errors.

Run: `npx next --version`
Expected: `15.1.0`.

- [ ] **Step 6: Commit**

```bash
git init
git add .
git commit -m "chore: bootstrap Next.js 15 + TypeScript + Tailwind"
```

---

## Task 2: Set up Vitest with happy-dom

**Files:**
- Create: `vitest.config.ts`, `tests/setup.ts`, `tests/unit/sanity.test.ts`

- [ ] **Step 1: Write the failing sanity test**

`tests/unit/sanity.test.ts`:
```ts
import { describe, expect, it } from 'vitest';

describe('sanity', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 2: Add vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: false,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

- [ ] **Step 3: Add tests/setup.ts (empty for now)**

```ts
// reserved for global test setup
export {};
```

- [ ] **Step 4: Run and verify**

Run: `npm test`
Expected: PASS for `sanity runs`.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts tests/setup.ts tests/unit/sanity.test.ts
git commit -m "test: set up Vitest with happy-dom"
```

---

## Task 3: Define core types

**Files:**
- Create: `src/types/skill.ts`, `src/types/run.ts`, `src/types/progress.ts`, `src/types/user.ts`

- [ ] **Step 1: Add src/types/skill.ts**

```ts
export type SkillRank = 'E-Rank' | 'D-Rank' | 'C-Rank' | 'B-Rank' | 'A-Rank' | 'S-Rank';

export interface Question {
  id: string;
  question: string;
  correct_answer: string;
  explanation: string;
  fake_answers: string[];
}

export interface Skill {
  skill_id: string;
  skill_name: string;
  difficulty: SkillRank;
  questions: Question[];
}
```

- [ ] **Step 2: Add src/types/run.ts**

```ts
export type Difficulty = 'normal' | 'hardcore';
export type AnswerResult = 'correct' | 'wrong' | 'bonus' | 'timeout';

export interface RunAnswer {
  questionId: string;
  result: AnswerResult;
}

export interface RunStats {
  correct: number;
  wrong: number;
  bonus: number;
  xpDelta: number;
  totalQuestions: number;
  accuracy: number; // 0..1
}

export interface RunDoc {
  _id: string;
  userId: string;
  skillId: string;
  difficulty: Difficulty;
  startedAt: Date;
  finishedAt: Date;
  stats: RunStats;
  leveledUp: boolean;
}
```

- [ ] **Step 3: Add src/types/progress.ts**

```ts
export interface ProgressDoc {
  _id: string;
  userId: string;
  skillId: string;
  totalXP: number;
  level: number;
  bestStreak: number;
  lastRunAccuracy: number;
  lastRunAt: Date | null;
  updatedAt: Date;
}

export interface DashboardProgress {
  skillId: string;
  skillName: string;
  difficulty: string;
  totalXP: number;
  level: number;
  lastRunAccuracy: number;
  lastRunAt: Date | null;
  bestStreak: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
}
```

- [ ] **Step 4: Add src/types/user.ts**

```ts
export interface UserDoc {
  _id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}
```

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/types/
git commit -m "feat: add core domain types"
```

---

## Task 4: Implement shuffle (Fisher-Yates) with TDD

**Files:**
- Create: `src/lib/shuffle.ts`, `tests/unit/shuffle.test.ts`

- [ ] **Step 1: Write failing tests**

`tests/unit/shuffle.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { shuffle, seededShuffle } from '@/lib/shuffle';

describe('shuffle', () => {
  it('returns array of same length', () => {
    const result = shuffle([1, 2, 3, 4, 5]);
    expect(result).toHaveLength(5);
  });

  it('contains all original elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result.sort()).toEqual(input);
  });

  it('does not mutate original', () => {
    const input = [1, 2, 3];
    shuffle(input);
    expect(input).toEqual([1, 2, 3]);
  });

  it('handles empty array', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('handles single element', () => {
    expect(shuffle([42])).toEqual([42]);
  });
});

describe('seededShuffle', () => {
  it('is deterministic for the same seed', () => {
    const a = seededShuffle([1, 2, 3, 4, 5, 6, 7], 42);
    const b = seededShuffle([1, 2, 3, 4, 5, 6, 7], 42);
    expect(a).toEqual(b);
  });

  it('differs across seeds', () => {
    const a = seededShuffle([1, 2, 3, 4, 5, 6, 7], 1);
    const b = seededShuffle([1, 2, 3, 4, 5, 6, 7], 2);
    expect(a).not.toEqual(b);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test tests/unit/shuffle.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement shuffle**

`src/lib/shuffle.ts`:
```ts
// Mulberry32 PRNG for seededShuffle
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fisherYates<T>(arr: T[], rng: () => number): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function shuffle<T>(arr: T[]): T[] {
  return fisherYates(arr, Math.random);
}

export function seededShuffle<T>(arr: T[], seed: number): T[] {
  return fisherYates(arr, mulberry32(seed));
}
```

- [ ] **Step 4: Run and verify pass**

Run: `npm test tests/unit/shuffle.test.ts`
Expected: all 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/shuffle.ts tests/unit/shuffle.test.ts
git commit -m "feat(lib): add Fisher-Yates shuffle with seeded variant"
```

---

## Task 5: Implement XP/level formulas with TDD

**Files:**
- Create: `src/lib/level.ts`, `tests/unit/level.test.ts`

- [ ] **Step 1: Write failing tests**

`tests/unit/level.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import {
  xpScoring,
  xpRequiredForLevel,
  levelFromXP,
  clampXP,
  xpProgressWithinLevel,
} from '@/lib/level';

describe('xpScoring', () => {
  it('defines correct/wrong/bonus deltas', () => {
    expect(xpScoring.correct).toBe(1);
    expect(xpScoring.wrong).toBe(-1);
    expect(xpScoring.bonusNoCorrect).toBe(2);
  });
});

describe('xpRequiredForLevel', () => {
  it('n*(n-1)*5 formula', () => {
    expect(xpRequiredForLevel(1)).toBe(0);
    expect(xpRequiredForLevel(2)).toBe(10);
    expect(xpRequiredForLevel(3)).toBe(30);
    expect(xpRequiredForLevel(4)).toBe(60);
    expect(xpRequiredForLevel(5)).toBe(100);
    expect(xpRequiredForLevel(10)).toBe(450);
  });
});

describe('levelFromXP', () => {
  it('level 1 at 0 XP', () => {
    expect(levelFromXP(0)).toBe(1);
  });
  it('level 1 just below threshold', () => {
    expect(levelFromXP(9)).toBe(1);
  });
  it('level 2 at exactly 10 XP', () => {
    expect(levelFromXP(10)).toBe(2);
  });
  it('level 3 at 30', () => {
    expect(levelFromXP(30)).toBe(3);
  });
  it('level 5 at 100', () => {
    expect(levelFromXP(100)).toBe(5);
  });
  it('level 10 at 450', () => {
    expect(levelFromXP(450)).toBe(10);
  });
  it('level 10 just below Lv 11 threshold (11*10*5 = 550)', () => {
    expect(levelFromXP(549)).toBe(10);
  });
});

describe('clampXP', () => {
  it('never negative', () => {
    expect(clampXP(-5)).toBe(0);
    expect(clampXP(0)).toBe(0);
    expect(clampXP(42)).toBe(42);
  });
});

describe('xpProgressWithinLevel', () => {
  it('returns 0 when exactly at level threshold', () => {
    const { current, next } = xpProgressWithinLevel(10);
    expect(current).toBe(10);
    expect(next).toBe(30);
  });
  it('progresses between thresholds', () => {
    const { current, next } = xpProgressWithinLevel(20);
    expect(current).toBe(10);
    expect(next).toBe(30);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test tests/unit/level.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement level.ts**

`src/lib/level.ts`:
```ts
export const xpScoring = {
  correct: 1,
  wrong: -1,
  bonusNoCorrect: 2,
} as const;

export function xpRequiredForLevel(n: number): number {
  return n * (n - 1) * 5;
}

export function levelFromXP(totalXP: number): number {
  const xp = clampXP(totalXP);
  // largest n such that n*(n-1)*5 <= xp
  // closed form: n = floor( (1 + sqrt(1 + 4*xp/5)) / 2 )
  return Math.floor((1 + Math.sqrt(1 + (4 * xp) / 5)) / 2);
}

export function clampXP(xp: number): number {
  return xp < 0 ? 0 : xp;
}

export function xpProgressWithinLevel(totalXP: number): {
  current: number;
  next: number;
} {
  const lvl = levelFromXP(totalXP);
  return {
    current: xpRequiredForLevel(lvl),
    next: xpRequiredForLevel(lvl + 1),
  };
}
```

- [ ] **Step 4: Run and verify pass**

Run: `npm test tests/unit/level.test.ts`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/level.ts tests/unit/level.test.ts
git commit -m "feat(lib): quadratic XP/level formulas"
```

---

## Task 6: Implement answer randomization with TDD

**Files:**
- Create: `src/lib/randomize.ts`, `tests/unit/randomize.test.ts`

- [ ] **Step 1: Write failing tests**

`tests/unit/randomize.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { generateAnswerSet, NO_CORRECT_PROBABILITY } from '@/lib/randomize';
import type { Question } from '@/types/skill';

const q: Question = {
  id: 'q1',
  question: 'x?',
  correct_answer: 'CORRECT',
  explanation: 'e',
  fake_answers: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11'],
};

describe('generateAnswerSet', () => {
  it('always returns 4 options', () => {
    for (let i = 0; i < 50; i++) {
      const { options } = generateAnswerSet(q);
      expect(options).toHaveLength(4);
    }
  });

  it('options are unique', () => {
    for (let i = 0; i < 50; i++) {
      const { options } = generateAnswerSet(q);
      expect(new Set(options).size).toBe(4);
    }
  });

  it('when hasCorrect=true, CORRECT is included', () => {
    const results = Array.from({ length: 200 }, () => generateAnswerSet(q));
    const withCorrect = results.filter((r) => r.hasCorrect);
    expect(withCorrect.length).toBeGreaterThan(0);
    for (const r of withCorrect) {
      expect(r.options).toContain('CORRECT');
    }
  });

  it('when hasCorrect=false, CORRECT is not included', () => {
    const results = Array.from({ length: 200 }, () => generateAnswerSet(q));
    const withoutCorrect = results.filter((r) => !r.hasCorrect);
    for (const r of withoutCorrect) {
      expect(r.options).not.toContain('CORRECT');
    }
  });

  it('no-correct case fires at configured probability (±5pp over 5000 iters)', () => {
    const N = 5000;
    let noCorrectCount = 0;
    for (let i = 0; i < N; i++) {
      const r = generateAnswerSet(q);
      if (!r.hasCorrect) noCorrectCount++;
    }
    const rate = noCorrectCount / N;
    expect(rate).toBeGreaterThan(NO_CORRECT_PROBABILITY - 0.05);
    expect(rate).toBeLessThan(NO_CORRECT_PROBABILITY + 0.05);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test tests/unit/randomize.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement randomize.ts**

`src/lib/randomize.ts`:
```ts
import type { Question } from '@/types/skill';
import { shuffle } from './shuffle';

export const NO_CORRECT_PROBABILITY = 0.18;

export interface AnswerSet {
  options: string[];
  hasCorrect: boolean;
}

function pickN<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

export function generateAnswerSet(question: Question): AnswerSet {
  const hasCorrect = Math.random() >= NO_CORRECT_PROBABILITY;
  if (hasCorrect) {
    const fakes = pickN(question.fake_answers, 3);
    return { options: shuffle([...fakes, question.correct_answer]), hasCorrect: true };
  }
  const fakes = pickN(question.fake_answers, 4);
  return { options: shuffle(fakes), hasCorrect: false };
}
```

- [ ] **Step 4: Run and verify pass**

Run: `npm test tests/unit/randomize.test.ts`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/randomize.ts tests/unit/randomize.test.ts
git commit -m "feat(lib): answer randomization with no-correct case"
```

---

## Task 7: Move skills JSON and add Zod validator

**Files:**
- Create: `src/lib/validate-skills.ts`, `scripts/validate-skills.ts`, `src/data/skills/*.json` (moved)
- Modify: existing `/question/*.json` → `src/data/skills/*.json`

- [ ] **Step 1: Move JSON files**

Run (bash):
```bash
mkdir -p src/data/skills
mv question/example.json src/data/skills/react-hooks.json
mv question/js-basics.json src/data/skills/js-basics.json
mv question/typescript.json src/data/skills/typescript.json
mv question/css-layout.json src/data/skills/css-layout.json
mv question/algorithms.json src/data/skills/algorithms.json
mv question/sql.json src/data/skills/sql.json
mv question/git.json src/data/skills/git.json
mv question/system-design.json src/data/skills/system-design.json
rmdir question || true
```

- [ ] **Step 2: Add validator module**

`src/lib/validate-skills.ts`:
```ts
import { z } from 'zod';
import type { Skill } from '@/types/skill';

export const questionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  correct_answer: z.string().min(1),
  explanation: z.string().min(1),
  fake_answers: z.array(z.string().min(1)).min(11),
});

export const skillSchema = z.object({
  skill_id: z.string().min(1),
  skill_name: z.string().min(1),
  difficulty: z.enum(['E-Rank', 'D-Rank', 'C-Rank', 'B-Rank', 'A-Rank', 'S-Rank']),
  questions: z.array(questionSchema).min(1),
});

export function validateSkill(data: unknown): Skill {
  const skill = skillSchema.parse(data);
  const ids = new Set<string>();
  for (const q of skill.questions) {
    if (ids.has(q.id)) {
      throw new Error(`Duplicate question id "${q.id}" in skill "${skill.skill_id}"`);
    }
    ids.add(q.id);
    const combined = [q.correct_answer, ...q.fake_answers];
    if (new Set(combined).size !== combined.length) {
      throw new Error(`Duplicate answer in question "${q.id}"`);
    }
  }
  return skill as Skill;
}
```

- [ ] **Step 3: Add runner script**

`scripts/validate-skills.ts`:
```ts
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateSkill } from '../src/lib/validate-skills';

const dir = join(process.cwd(), 'src/data/skills');
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

let ok = true;
for (const f of files) {
  try {
    const raw = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    const skill = validateSkill(raw);
    console.log(`OK  ${f}  (${skill.questions.length} q)`);
  } catch (err) {
    ok = false;
    console.error(`FAIL ${f}  ${(err as Error).message}`);
  }
}
process.exit(ok ? 0 : 1);
```

- [ ] **Step 4: Add validator unit test**

`tests/unit/validate-skills.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { validateSkill } from '@/lib/validate-skills';

const valid = {
  skill_id: 'x',
  skill_name: 'X',
  difficulty: 'B-Rank',
  questions: [
    {
      id: 'q1',
      question: 'Q?',
      correct_answer: 'A',
      explanation: 'e',
      fake_answers: ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
    },
  ],
};

describe('validateSkill', () => {
  it('accepts valid', () => {
    expect(() => validateSkill(valid)).not.toThrow();
  });
  it('rejects < 11 fake_answers', () => {
    expect(() => validateSkill({ ...valid, questions: [{ ...valid.questions[0], fake_answers: ['B'] }] })).toThrow();
  });
  it('rejects duplicate question ids', () => {
    expect(() =>
      validateSkill({
        ...valid,
        questions: [valid.questions[0], { ...valid.questions[0] }],
      }),
    ).toThrow(/Duplicate question id/);
  });
  it('rejects duplicate answer inside a question', () => {
    expect(() =>
      validateSkill({
        ...valid,
        questions: [
          {
            ...valid.questions[0],
            fake_answers: ['A', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
          },
        ],
      }),
    ).toThrow(/Duplicate answer/);
  });
});
```

- [ ] **Step 5: Run validator**

Run: `npm run validate:skills`
Expected: all 8 files OK. If any FAIL — fix the JSON to meet schema (11+ fake_answers, unique ids).

Run: `npm test tests/unit/validate-skills.test.ts`
Expected: 4 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/data/ src/lib/validate-skills.ts scripts/validate-skills.ts tests/unit/validate-skills.test.ts
git rm -r question 2>/dev/null || true
git commit -m "feat: move skills to src/data and add Zod validator"
```

---

## Task 8: Add skills loader for client

**Files:**
- Create: `src/lib/skills-loader.ts`, `src/data/skills-manifest.ts`

- [ ] **Step 1: Add manifest**

`src/data/skills-manifest.ts`:
```ts
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
```

- [ ] **Step 2: Add loader**

`src/lib/skills-loader.ts`:
```ts
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
  // hardcoded for SSR; client loads full JSON on demand
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
```

- [ ] **Step 3: Copy skills JSON into /public for client fetch**

Run:
```bash
mkdir -p public/skills
cp src/data/skills/*.json public/skills/
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/skills-loader.ts src/data/skills-manifest.ts public/skills/
git commit -m "feat: add skills loader with client-side caching"
```

---

## Task 9: Add theme engine

**Files:**
- Create: `src/lib/theme.ts`, `tests/unit/theme.test.ts`

- [ ] **Step 1: Write failing tests**

`tests/unit/theme.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { dailyThemes, getThemeForDay } from '@/lib/theme';

describe('dailyThemes', () => {
  it('has 7 entries keyed 0..6', () => {
    expect(Object.keys(dailyThemes).sort()).toEqual(['0', '1', '2', '3', '4', '5', '6']);
  });
  it('each entry has accent, label, bg', () => {
    for (const day of [0, 1, 2, 3, 4, 5, 6] as const) {
      const t = dailyThemes[day];
      expect(t.accent).toMatch(/^#[0-9A-F]{6}$/i);
      expect(t.label).toBeTruthy();
      expect(t.bg).toMatch(/\.(webp|svg)$/);
    }
  });
});

describe('getThemeForDay', () => {
  it('normalizes day index', () => {
    expect(getThemeForDay(0)).toBe(dailyThemes[0]);
    expect(getThemeForDay(7)).toBe(dailyThemes[0]);
    expect(getThemeForDay(-1)).toBe(dailyThemes[6]);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test tests/unit/theme.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement theme.ts**

`src/lib/theme.ts`:
```ts
export interface DailyTheme {
  accent: string;
  label: string;
  bg: string;
}

export const dailyThemes: Record<0 | 1 | 2 | 3 | 4 | 5 | 6, DailyTheme> = {
  0: { accent: '#4F4F4F', label: 'Rest',     bg: '/bg/sun.svg' },
  1: { accent: '#00F2FF', label: 'Energy',   bg: '/bg/mon.svg' },
  2: { accent: '#00FF85', label: 'Growth',   bg: '/bg/tue.svg' },
  3: { accent: '#FFD600', label: 'Focus',    bg: '/bg/wed.svg' },
  4: { accent: '#FF7A00', label: 'Pressure', bg: '/bg/thu.svg' },
  5: { accent: '#FF005C', label: 'Finish',   bg: '/bg/fri.svg' },
  6: { accent: '#BD00FF', label: 'Magic',    bg: '/bg/sat.svg' },
};

export function getThemeForDay(day: number): DailyTheme {
  const normalized = ((day % 7) + 7) % 7;
  return dailyThemes[normalized as 0 | 1 | 2 | 3 | 4 | 5 | 6];
}
```

- [ ] **Step 4: Run and verify pass**

Run: `npm test tests/unit/theme.test.ts`
Expected: all tests pass.

- [ ] **Step 5: Add 7 SVG gradient backgrounds to /public/bg/**

For each day, write `public/bg/{mon,tue,wed,thu,fri,sat,sun}.svg` with this template (replace `ACCENT_COLOR` per theme):

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
  <defs>
    <radialGradient id="g" cx="20%" cy="10%" r="80%">
      <stop offset="0%" stop-color="ACCENT_COLOR" stop-opacity="0.12"/>
      <stop offset="60%" stop-color="ACCENT_COLOR" stop-opacity="0.02"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="ACCENT_COLOR" stroke-opacity="0.04" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1440" height="900" fill="#0a0a0a"/>
  <rect width="1440" height="900" fill="url(#grid)"/>
  <rect width="1440" height="900" fill="url(#g)"/>
</svg>
```

Colors: mon=#00F2FF, tue=#00FF85, wed=#FFD600, thu=#FF7A00, fri=#FF005C, sat=#BD00FF, sun=#4F4F4F.

- [ ] **Step 6: Commit**

```bash
git add src/lib/theme.ts tests/unit/theme.test.ts public/bg/
git commit -m "feat: theme engine with daily SVG backgrounds"
```

---

## Task 10: Add MongoDB connection helper

**Files:**
- Create: `src/lib/mongo.ts`

- [ ] **Step 1: Implement mongo.ts**

`src/lib/mongo.ts`:
```ts
import { MongoClient, type Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('MONGODB_URI is required');

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: Promise<MongoClient> | undefined;
}

const client =
  global._mongoClient ?? (global._mongoClient = new MongoClient(uri).connect());

export async function getDb(): Promise<Db> {
  return (await client).db('shadow-leveling');
}

export async function ensureIndexes(): Promise<void> {
  const db = await getDb();
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('progress').createIndex({ userId: 1, skillId: 1 }, { unique: true });
  await db.collection('runs').createIndex({ userId: 1, skillId: 1, finishedAt: -1 });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/mongo.ts
git commit -m "feat(lib): MongoDB connection with cached client"
```

---

## Task 11: NextAuth v5 config + register route (integration test)

**Files:**
- Create: `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/app/api/auth/register/route.ts`, `tests/integration/register-api.test.ts`
- Modify: `src/types/session.ts` (NextAuth augmentation)

- [ ] **Step 1: Add types/session.ts augmentation**

```ts
import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
  }
  interface Session {
    user: { id: string; email: string };
  }
}
```

- [ ] **Step 2: Implement auth.ts**

`src/lib/auth.ts`:
```ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getDb } from './mongo';
import { ObjectId } from 'mongodb';

export const { auth, handlers, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(creds) {
        const email = String(creds?.email ?? '').toLowerCase().trim();
        const password = String(creds?.password ?? '');
        if (!email || !password) return null;
        const db = await getDb();
        const user = await db.collection('users').findOne({ email });
        if (!user) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return { id: (user._id as ObjectId).toString(), email: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
});
```

- [ ] **Step 3: Add NextAuth route handler**

`src/app/api/auth/[...nextauth]/route.ts`:
```ts
import { handlers } from '@/lib/auth';
export const { GET, POST } = handlers;
```

- [ ] **Step 4: Add register route**

`src/app/api/auth/register/route.ts`:
```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getDb, ensureIndexes } from '@/lib/mongo';

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'invalid input', code: 'invalid_input' },
      { status: 400 },
    );
  }
  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();
  await ensureIndexes();
  const db = await getDb();
  const existing = await db.collection('users').findOne({ email: normalizedEmail });
  if (existing) {
    return NextResponse.json({ ok: false, error: 'Email already registered', code: 'email_taken' }, { status: 409 });
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await db.collection('users').insertOne({
    email: normalizedEmail,
    passwordHash,
    createdAt: new Date(),
  });
  return NextResponse.json({ ok: true, userId: result.insertedId.toString() });
}
```

- [ ] **Step 5: Write integration test**

`tests/integration/register-api.test.ts`:
```ts
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';

let mongod: MongoMemoryServer;
let client: MongoClient;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
});

afterAll(async () => {
  await client.close();
  await mongod.stop();
});

beforeEach(async () => {
  await client.db('shadow-leveling').collection('users').deleteMany({});
});

describe('POST /api/auth/register', () => {
  it('rejects missing email', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const res = await POST(new Request('http://x/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ password: 'longenough' }),
    }));
    expect(res.status).toBe(400);
  });

  it('rejects short password', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const res = await POST(new Request('http://x/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'a@b.com', password: '123' }),
    }));
    expect(res.status).toBe(400);
  });

  it('creates user and rejects duplicate', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const res1 = await POST(new Request('http://x/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'a@b.com', password: 'longenough' }),
    }));
    expect(res1.status).toBe(200);
    const res2 = await POST(new Request('http://x/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'a@b.com', password: 'longenough' }),
    }));
    expect(res2.status).toBe(409);
  });
});
```

- [ ] **Step 6: Run and verify pass**

Run: `npm test tests/integration/register-api.test.ts`
Expected: 3 tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/lib/auth.ts src/app/api src/types/session.ts tests/integration/register-api.test.ts
git commit -m "feat(auth): NextAuth v5 Credentials + register route"
```

---

## Task 12: Add middleware for protected routes

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Implement middleware**

`src/middleware.ts`:
```ts
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;
  const isAuthPage = path.startsWith('/login') || path.startsWith('/register');
  const isApp = path.startsWith('/dashboard') || path.startsWith('/test');

  if (isApp && !isLoggedIn) {
    const url = new URL('/login', req.nextUrl);
    return NextResponse.redirect(url);
  }
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/test/:path*', '/login', '/register'],
};
```

- [ ] **Step 2: Commit**

```bash
git add src/middleware.ts
git commit -m "feat(auth): protect /dashboard and /test via middleware"
```

---

## Task 13: Global styles + ThemeProvider

**Files:**
- Create: `src/app/globals.css`, `src/components/ThemeProvider.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Write globals.css**

`src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --accent-color: #00FF85;
  --accent-dim: rgba(0, 255, 133, 0.55);
}

html, body {
  background: #0a0a0a;
  color: #E6F7EE;
  font-family: ui-monospace, monospace;
  min-height: 100vh;
}

body {
  background-image:
    radial-gradient(circle at 20% -10%, var(--accent-dim) 0%, transparent 50%),
    linear-gradient(transparent 95%, rgba(255,255,255,0.02) 95%);
  background-size: auto, 100% 3px;
  background-attachment: fixed;
}

@layer utilities {
  .glow { box-shadow: 0 0 14px var(--accent-dim); }
  .text-glow { text-shadow: 0 0 8px var(--accent-dim); }
  .border-glow { border: 1px solid var(--accent-color); box-shadow: 0 0 14px var(--accent-dim); }
  .scanline { background-image: linear-gradient(transparent 95%, var(--accent-dim) 95%); background-size: 100% 3px; }
}
```

- [ ] **Step 2: Write ThemeProvider**

`src/components/ThemeProvider.tsx`:
```tsx
'use client';
import { useEffect } from 'react';
import { getThemeForDay } from '@/lib/theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const apply = () => {
      const theme = getThemeForDay(new Date().getDay());
      const root = document.documentElement;
      root.style.setProperty('--accent-color', theme.accent);
      root.style.setProperty(
        '--accent-dim',
        theme.accent + '8c', // ~55% alpha in hex
      );
      document.body.style.backgroundImage = `url(${theme.bg})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundAttachment = 'fixed';
    };
    apply();
    const interval = setInterval(apply, 60_000 * 30);
    return () => clearInterval(interval);
  }, []);
  return <>{children}</>;
}
```

- [ ] **Step 3: Wire in root layout**

`src/app/layout.tsx`:
```tsx
import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Shadow Leveling',
  description: 'Train your skills. Level up. Solo Leveling edition.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Add root redirect page**

`src/app/page.tsx`:
```tsx
import { redirect } from 'next/navigation';
export default function Home() {
  redirect('/dashboard');
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx src/app/page.tsx src/components/ThemeProvider.tsx
git commit -m "feat(ui): global styles + ThemeProvider"
```

---

## Task 14: UI primitives — NeonButton, NeonCard, HexBadge, ProgressBar, ProgressDots, SystemModal

**Files:**
- Create: `src/components/ui/NeonButton.tsx`, `NeonCard.tsx`, `HexBadge.tsx`, `ProgressBar.tsx`, `ProgressDots.tsx`, `SystemModal.tsx`

- [ ] **Step 1: NeonButton**

`src/components/ui/NeonButton.tsx`:
```tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'accent' | 'danger' | 'dashed-danger';
  size?: 'sm' | 'md' | 'lg';
}

export const NeonButton = forwardRef<HTMLButtonElement, Props>(function NeonButton(
  { className, variant = 'accent', size = 'md', ...props },
  ref,
) {
  const base = 'font-mono uppercase tracking-widest transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';
  const sizes = { sm: 'text-[10px] px-2 py-1', md: 'text-xs px-3 py-2', lg: 'text-sm px-4 py-3' };
  const variants = {
    accent: 'bg-transparent border border-accent text-accent hover:shadow-glow hover:bg-[rgba(255,255,255,0.04)]',
    danger: 'bg-transparent border border-danger text-danger hover:shadow-[0_0_14px_#FF005C]',
    'dashed-danger': 'bg-transparent border border-dashed border-danger text-danger hover:bg-[rgba(255,0,92,0.06)]',
  };
  return <button ref={ref} className={clsx(base, sizes[size], variants[variant], className)} {...props} />;
});
```

Install `clsx`:
```bash
npm install clsx
```

- [ ] **Step 2: NeonCard**

`src/components/ui/NeonCard.tsx`:
```tsx
import type { HTMLAttributes } from 'react';
import clsx from 'clsx';

export function NeonCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'bg-bg border border-[color:var(--accent-color)]/25 text-text font-mono p-4 relative',
        'before:content-[""] before:absolute before:inset-[-1px] before:border before:border-accent before:opacity-[0.12] before:pointer-events-none',
        className,
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 3: HexBadge**

`src/components/ui/HexBadge.tsx`:
```tsx
interface Props {
  rank: string; // "B", "B-Rank", "S-Rank" → takes first letter
  size?: number;
}

export function HexBadge({ rank, size = 40 }: Props) {
  const letter = rank.charAt(0).toUpperCase();
  return (
    <div
      className="flex items-center justify-center text-accent font-bold text-glow"
      style={{
        width: size,
        height: size * 1.15,
        clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)',
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--accent-color) 20%, transparent), color-mix(in srgb, var(--accent-color) 2%, transparent))',
        border: '1px solid var(--accent-color)',
      }}
    >
      {letter}
    </div>
  );
}
```

- [ ] **Step 4: ProgressBar**

`src/components/ui/ProgressBar.tsx`:
```tsx
interface Props {
  value: number; // 0..1
}
export function ProgressBar({ value }: Props) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className="h-[6px] bg-white/5 relative overflow-hidden">
      <span
        className="block h-full bg-accent shadow-glow"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
```

- [ ] **Step 5: ProgressDots**

`src/components/ui/ProgressDots.tsx`:
```tsx
interface Props {
  results: Array<'done' | 'wrong' | 'cur' | 'pending'>;
}
export function ProgressDots({ results }: Props) {
  return (
    <div className="flex gap-1 my-2">
      {results.map((r, i) => (
        <div
          key={i}
          className={
            r === 'done'
              ? 'w-[18px] h-[3px] bg-accent shadow-[0_0_6px_var(--accent-dim)]'
              : r === 'wrong'
                ? 'w-[18px] h-[3px] bg-danger shadow-[0_0_6px_#FF005C]'
                : r === 'cur'
                  ? 'w-[18px] h-[3px] bg-accent opacity-50'
                  : 'w-[18px] h-[3px] bg-white/5'
          }
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 6: SystemModal**

`src/components/ui/SystemModal.tsx`:
```tsx
'use client';
import { type ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
}
export function SystemModal({ open, onClose, title, children }: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 backdrop-blur-sm bg-black/70 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-bg border-glow p-6 max-w-md w-[90%] font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="text-accent text-glow uppercase tracking-widest mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Typecheck + commit**

Run: `npm run typecheck`
Expected: no errors.

```bash
git add src/components/ui/ package.json package-lock.json
git commit -m "feat(ui): neon primitives — button, card, hex badge, progress, modal"
```

---

## Task 15: Icon component with stub renderer

**Files:**
- Create: `src/components/ui/Icon.tsx`
- Modify: move `icons-registry.json` → `src/data/icons-registry.json`

- [ ] **Step 1: Move registry**

Run: `mv icons-registry.json src/data/icons-registry.json`

- [ ] **Step 2: Implement Icon component**

`src/components/ui/Icon.tsx`:
```tsx
import registry from '@/data/icons-registry.json';

type Entry = { id: string; label: string; purpose: string; status: 'stub' | 'ready' };
const allIcons: Entry[] = [
  ...(registry.categories.navigation as Entry[]),
  ...(registry.categories.gameplay as Entry[]),
  ...(registry.categories.system as Entry[]),
];
const byId = new Map(allIcons.map((e) => [e.id, e]));

interface Props {
  name: string;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 24, className }: Props) {
  const entry = byId.get(name);
  if (!entry) return null;
  if (entry.status === 'ready') {
    return (
      <img
        src={`/icons/${entry.id}.svg`}
        alt={entry.label}
        title={entry.label}
        width={size}
        height={size}
        className={className}
      />
    );
  }
  const letters = entry.id
    .split('-')
    .map((w) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      data-icon={entry.id}
      aria-label={entry.label}
      className={className}
      style={{ color: 'var(--accent-color)' }}
    >
      <title>{entry.label}</title>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
      <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor" fontFamily="monospace">
        {letters}
      </text>
    </svg>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/data/icons-registry.json src/components/ui/Icon.tsx
git rm icons-registry.json 2>/dev/null || true
git commit -m "feat(ui): Icon component with stub SVG renderer"
```

---

## Task 16: Login and Register pages

**Files:**
- Create: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`, `src/app/(auth)/layout.tsx`

- [ ] **Step 1: Auth layout**

`src/app/(auth)/layout.tsx`:
```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen flex items-center justify-center p-6">{children}</div>;
}
```

- [ ] **Step 2: Login page**

`src/app/(auth)/login/page.tsx`:
```tsx
'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { NeonCard } from '@/components/ui/NeonCard';
import { NeonButton } from '@/components/ui/NeonButton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError('Невірний email або пароль');
    else window.location.href = '/dashboard';
  }

  return (
    <NeonCard className="max-w-sm w-full">
      <div className="text-center mb-5">
        <div className="text-[10px] tracking-widest text-muted uppercase">[ SYSTEM ACCESS ]</div>
        <div className="text-2xl tracking-[0.25em] text-accent text-glow mt-1">SHADOW LEVELING</div>
        <div className="text-[11px] tracking-widest text-muted mt-1">AUTHORIZE TO CONTINUE</div>
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="EMAIL"
          className="block w-full p-3 bg-transparent border border-[color:var(--accent-color)]/25 text-text focus:border-accent focus:outline-none focus:shadow-glow"
        />
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="PASSWORD"
          className="block w-full p-3 bg-transparent border border-[color:var(--accent-color)]/25 text-text focus:border-accent focus:outline-none focus:shadow-glow"
        />
        {error && <div className="text-danger text-xs tracking-wider">{error}</div>}
        <NeonButton type="submit" disabled={loading} size="lg" className="w-full">
          {loading ? 'LOADING...' : '▶ ENTER THE SYSTEM'}
        </NeonButton>
        <div className="text-center text-[11px] tracking-widest text-muted pt-2">
          NO ACCOUNT? <Link href="/register" className="text-accent">REGISTER</Link>
        </div>
      </form>
    </NeonCard>
  );
}
```

- [ ] **Step 3: Register page**

`src/app/(auth)/register/page.tsx`:
```tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { NeonCard } from '@/components/ui/NeonCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.ok) {
      setError(data.error ?? 'Registration failed');
      setLoading(false);
      return;
    }
    await signIn('credentials', { email, password, redirect: false });
    window.location.href = '/dashboard';
  }

  return (
    <NeonCard className="max-w-sm w-full">
      <div className="text-center mb-5">
        <div className="text-[10px] tracking-widest text-muted uppercase">[ NEW HUNTER REGISTRATION ]</div>
        <div className="text-2xl tracking-[0.25em] text-accent text-glow mt-1">SHADOW LEVELING</div>
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="EMAIL"
          className="block w-full p-3 bg-transparent border border-[color:var(--accent-color)]/25 text-text focus:border-accent focus:outline-none focus:shadow-glow" />
        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="PASSWORD (≥8)"
          className="block w-full p-3 bg-transparent border border-[color:var(--accent-color)]/25 text-text focus:border-accent focus:outline-none focus:shadow-glow" />
        {error && <div className="text-danger text-xs tracking-wider">{error}</div>}
        <NeonButton type="submit" disabled={loading} size="lg" className="w-full">
          {loading ? 'LOADING...' : '◢ CREATE ACCOUNT'}
        </NeonButton>
        <div className="text-center text-[11px] tracking-widest text-muted pt-2">
          HAVE ACCOUNT? <Link href="/login" className="text-accent">LOGIN</Link>
        </div>
      </form>
    </NeonCard>
  );
}
```

- [ ] **Step 4: Add next-auth/react SessionProvider wrapper**

Create `src/components/SessionClientProvider.tsx`:
```tsx
'use client';
import { SessionProvider } from 'next-auth/react';
export function SessionClientProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

Modify `src/app/layout.tsx` to wrap ThemeProvider inside SessionClientProvider:
```tsx
import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SessionClientProvider } from '@/components/SessionClientProvider';

export const metadata: Metadata = {
  title: 'Shadow Leveling',
  description: 'Train your skills. Level up.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body>
        <SessionClientProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/\(auth\)/ src/components/SessionClientProvider.tsx src/app/layout.tsx
git commit -m "feat(auth): login and register pages"
```

---

## Task 17: /api/progress route

**Files:**
- Create: `src/app/api/progress/route.ts`

- [ ] **Step 1: Implement progress API**

`src/app/api/progress/route.ts`:
```ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { getSkillMetadata } from '@/lib/skills-loader';
import { levelFromXP, xpProgressWithinLevel } from '@/lib/level';
import type { DashboardProgress } from '@/types/progress';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: 'Unauthorized', code: 'unauthorized' }, { status: 401 });
  }
  const userId = new ObjectId(session.user.id);
  const db = await getDb();
  const rows = await db.collection('progress').find({ userId }).toArray();
  const metadata = getSkillMetadata();

  const progress: DashboardProgress[] = metadata.map((meta) => {
    const row = rows.find((r) => r.skillId === meta.skill_id);
    const totalXP = row?.totalXP ?? 0;
    const level = levelFromXP(totalXP);
    const { current, next } = xpProgressWithinLevel(totalXP);
    return {
      skillId: meta.skill_id,
      skillName: meta.skill_name,
      difficulty: meta.difficulty,
      totalXP,
      level,
      lastRunAccuracy: row?.lastRunAccuracy ?? 0,
      lastRunAt: row?.lastRunAt ?? null,
      bestStreak: row?.bestStreak ?? 0,
      xpForCurrentLevel: current,
      xpForNextLevel: next,
    };
  });
  return NextResponse.json({ ok: true, progress });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/progress/route.ts
git commit -m "feat(api): GET /api/progress aggregated for dashboard"
```

---

## Task 18: SkillCard + DifficultyModal

**Files:**
- Create: `src/components/dashboard/SkillCard.tsx`, `src/components/dashboard/DifficultyModal.tsx`

- [ ] **Step 1: SkillCard**

`src/components/dashboard/SkillCard.tsx`:
```tsx
'use client';
import { useState } from 'react';
import { NeonCard } from '@/components/ui/NeonCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { HexBadge } from '@/components/ui/HexBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { DifficultyModal } from './DifficultyModal';
import type { DashboardProgress } from '@/types/progress';

export function SkillCard({ p }: { p: DashboardProgress }) {
  const [modalOpen, setModalOpen] = useState(false);
  const inLevel = p.totalXP - p.xpForCurrentLevel;
  const needed = p.xpForNextLevel - p.xpForCurrentLevel;
  const fraction = needed > 0 ? inLevel / needed : 0;

  return (
    <>
      <NeonCard className="relative pl-[70px]">
        <div className="absolute left-3.5 top-3.5">
          <HexBadge rank={p.difficulty} />
        </div>
        <div className="text-[10px] tracking-widest text-muted uppercase">
          LV.{p.level} · {p.difficulty}
        </div>
        <div className="text-[18px] text-accent text-glow mt-1 mb-2 uppercase">{p.skillName}</div>
        <ProgressBar value={fraction} />
        <div className="flex justify-between text-[11px] mt-1.5">
          <span>
            {p.totalXP} / {p.xpForNextLevel} XP
          </span>
          <span className="text-muted">
            {p.lastRunAt ? `last: ${Math.round(p.lastRunAccuracy * 100)}%` : 'no runs yet'}
          </span>
        </div>
        <div className="mt-3.5">
          <NeonButton className="w-full" onClick={() => setModalOpen(true)}>
            ◢ ENTER DUNGEON
          </NeonButton>
        </div>
      </NeonCard>
      <DifficultyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        skillId={p.skillId}
        skillName={p.skillName}
      />
    </>
  );
}
```

- [ ] **Step 2: DifficultyModal**

`src/components/dashboard/DifficultyModal.tsx`:
```tsx
'use client';
import { SystemModal } from '@/components/ui/SystemModal';
import { NeonButton } from '@/components/ui/NeonButton';
import { useRouter } from 'next/navigation';

interface Props {
  open: boolean;
  onClose: () => void;
  skillId: string;
  skillName: string;
}

export function DifficultyModal({ open, onClose, skillId, skillName }: Props) {
  const router = useRouter();

  function start(mode: 'normal' | 'hardcore') {
    router.push(`/test/${skillId}?mode=${mode}`);
  }

  return (
    <SystemModal open={open} onClose={onClose} title={`▶ ${skillName}`}>
      <p className="text-[11px] tracking-widest text-muted mb-4 uppercase">
        SELECT DIFFICULTY
      </p>
      <div className="space-y-2">
        <NeonButton size="lg" className="w-full" onClick={() => start('normal')}>
          NORMAL · 30 SEC / QUESTION
        </NeonButton>
        <NeonButton size="lg" variant="danger" className="w-full" onClick={() => start('hardcore')}>
          HARDCORE · 10 SEC / QUESTION
        </NeonButton>
      </div>
    </SystemModal>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/
git commit -m "feat(dashboard): SkillCard with hex-badge + DifficultyModal"
```

---

## Task 19: Dashboard page + (app) layout + navbar

**Files:**
- Create: `src/app/(app)/layout.tsx`, `src/app/(app)/dashboard/page.tsx`, `src/components/Navbar.tsx`

- [ ] **Step 1: Navbar**

`src/components/Navbar.tsx`:
```tsx
'use client';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';

export function Navbar() {
  const { data: session } = useSession();
  return (
    <nav className="border-b border-[color:var(--accent-color)]/20 p-4 flex justify-between items-center">
      <Link href="/dashboard" className="text-accent text-glow tracking-widest font-bold flex items-center gap-2">
        <Icon name="winged-dagger" size={20} />
        SHADOW LEVELING
      </Link>
      <div className="flex items-center gap-4 text-[11px] tracking-widest text-muted">
        <span>{session?.user?.email}</span>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-accent hover:text-glow uppercase"
        >
          ⎋ LOGOUT
        </button>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: (app) layout**

`src/app/(app)/layout.tsx`:
```tsx
import { Navbar } from '@/components/Navbar';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto p-6">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Dashboard page**

`src/app/(app)/dashboard/page.tsx`:
```tsx
import { SkillCard } from '@/components/dashboard/SkillCard';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { getSkillMetadata } from '@/lib/skills-loader';
import { levelFromXP, xpProgressWithinLevel } from '@/lib/level';
import type { DashboardProgress } from '@/types/progress';

async function fetchProgress(userId: string): Promise<DashboardProgress[]> {
  const db = await getDb();
  const rows = await db.collection('progress').find({ userId: new ObjectId(userId) }).toArray();
  return getSkillMetadata().map((meta) => {
    const row = rows.find((r) => r.skillId === meta.skill_id);
    const totalXP = row?.totalXP ?? 0;
    const { current, next } = xpProgressWithinLevel(totalXP);
    return {
      skillId: meta.skill_id,
      skillName: meta.skill_name,
      difficulty: meta.difficulty,
      totalXP,
      level: levelFromXP(totalXP),
      lastRunAccuracy: row?.lastRunAccuracy ?? 0,
      lastRunAt: row?.lastRunAt ?? null,
      bestStreak: row?.bestStreak ?? 0,
      xpForCurrentLevel: current,
      xpForNextLevel: next,
    };
  });
}

export default async function DashboardPage() {
  const session = await auth();
  const progress = await fetchProgress(session!.user.id);
  return (
    <div>
      <div className="text-[10px] tracking-widest text-muted uppercase mb-2">[ SKILL MATRIX ]</div>
      <h1 className="text-accent text-glow text-2xl tracking-widest uppercase mb-6">DUNGEONS</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {progress.map((p) => (
          <SkillCard key={p.skillId} p={p} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(app\)/ src/components/Navbar.tsx
git commit -m "feat(app): protected layout + dashboard with skill cards"
```

---

## Task 20: Zustand run store with sessionStorage persist

**Files:**
- Create: `src/store/useRunStore.ts`

- [ ] **Step 1: Implement store**

`src/store/useRunStore.ts`:
```ts
'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Question } from '@/types/skill';
import type { Difficulty, AnswerResult, RunAnswer } from '@/types/run';
import { generateAnswerSet } from '@/lib/randomize';
import { shuffle } from '@/lib/shuffle';

export interface CurrentAnswerSet {
  options: string[];
  hasCorrect: boolean;
}

interface RunState {
  skillId: string | null;
  difficulty: Difficulty;
  queue: Question[];
  currentIndex: number;
  currentAnswerSet: CurrentAnswerSet | null;
  answers: RunAnswer[];
  correctCount: number;
  wrongCount: number;
  bonusCount: number;
  xpDelta: number;
  startedAt: string | null;
  remainingMs: number;
  pausedAt: number | null;
  status: 'idle' | 'running' | 'penalty' | 'explaining' | 'finished';

  startRun: (args: { skillId: string; difficulty: Difficulty; questions: Question[] }) => void;
  tick: (deltaMs: number) => void;
  pause: () => void;
  resume: () => void;
  registerAnswer: (result: AnswerResult) => void;
  advance: () => void;
  reset: () => void;
}

function timerFor(diff: Difficulty) {
  return diff === 'hardcore' ? 10_000 : 30_000;
}

export const useRunStore = create<RunState>()(
  persist(
    (set, get) => ({
      skillId: null,
      difficulty: 'normal',
      queue: [],
      currentIndex: 0,
      currentAnswerSet: null,
      answers: [],
      correctCount: 0,
      wrongCount: 0,
      bonusCount: 0,
      xpDelta: 0,
      startedAt: null,
      remainingMs: 0,
      pausedAt: null,
      status: 'idle',

      startRun: ({ skillId, difficulty, questions }) => {
        const shuffled = shuffle(questions);
        const first = shuffled[0];
        set({
          skillId,
          difficulty,
          queue: shuffled,
          currentIndex: 0,
          currentAnswerSet: first ? generateAnswerSet(first) : null,
          answers: [],
          correctCount: 0,
          wrongCount: 0,
          bonusCount: 0,
          xpDelta: 0,
          startedAt: new Date().toISOString(),
          remainingMs: timerFor(difficulty),
          pausedAt: null,
          status: 'running',
        });
      },

      tick: (deltaMs) => {
        const { status, remainingMs } = get();
        if (status !== 'running') return;
        const next = remainingMs - deltaMs;
        if (next <= 0) {
          set({ remainingMs: 0 });
          get().registerAnswer('timeout');
        } else {
          set({ remainingMs: next });
        }
      },

      pause: () => set({ pausedAt: Date.now() }),
      resume: () => set({ pausedAt: null }),

      registerAnswer: (result) => {
        const { queue, currentIndex, correctCount, wrongCount, bonusCount, xpDelta, answers } = get();
        const q = queue[currentIndex];
        if (!q) return;
        const delta = result === 'correct' ? 1 : result === 'bonus' ? 2 : -1;
        const nextStatus: RunState['status'] = result === 'correct' || result === 'bonus' ? 'explaining' : 'penalty';
        set({
          answers: [...answers, { questionId: q.id, result }],
          correctCount: correctCount + (result === 'correct' ? 1 : 0),
          wrongCount: wrongCount + (result === 'wrong' || result === 'timeout' ? 1 : 0),
          bonusCount: bonusCount + (result === 'bonus' ? 1 : 0),
          xpDelta: xpDelta + delta,
          status: nextStatus,
        });
      },

      advance: () => {
        const { queue, currentIndex, difficulty } = get();
        const nextIndex = currentIndex + 1;
        if (nextIndex >= queue.length) {
          set({ status: 'finished' });
          return;
        }
        const q = queue[nextIndex];
        set({
          currentIndex: nextIndex,
          currentAnswerSet: generateAnswerSet(q),
          remainingMs: timerFor(difficulty),
          status: 'running',
        });
      },

      reset: () =>
        set({
          skillId: null,
          queue: [],
          currentIndex: 0,
          currentAnswerSet: null,
          answers: [],
          correctCount: 0,
          wrongCount: 0,
          bonusCount: 0,
          xpDelta: 0,
          startedAt: null,
          remainingMs: 0,
          status: 'idle',
        }),
    }),
    {
      name: 'shadow-leveling-run',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        skillId: s.skillId,
        difficulty: s.difficulty,
        queue: s.queue,
        currentIndex: s.currentIndex,
        currentAnswerSet: s.currentAnswerSet,
        answers: s.answers,
        correctCount: s.correctCount,
        wrongCount: s.wrongCount,
        bonusCount: s.bonusCount,
        xpDelta: s.xpDelta,
        startedAt: s.startedAt,
        remainingMs: s.remainingMs,
        status: s.status,
      }),
    },
  ),
);
```

- [ ] **Step 2: Commit**

```bash
git add src/store/useRunStore.ts
git commit -m "feat(store): useRunStore with sessionStorage persistence"
```

---

## Task 21: Timer component

**Files:**
- Create: `src/components/test/Timer.tsx`

- [ ] **Step 1: Implement**

`src/components/test/Timer.tsx`:
```tsx
'use client';
import { useEffect } from 'react';
import { useRunStore } from '@/store/useRunStore';

export function Timer() {
  const remainingMs = useRunStore((s) => s.remainingMs);
  const status = useRunStore((s) => s.status);
  const tick = useRunStore((s) => s.tick);

  useEffect(() => {
    if (status !== 'running') return;
    const id = setInterval(() => tick(1000), 1000);
    return () => clearInterval(id);
  }, [status, tick]);

  const seconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const warn = seconds <= 5;
  return (
    <div
      className={
        warn
          ? 'text-[28px] tracking-[4px] text-danger [text-shadow:0_0_14px_#FF005C]'
          : 'text-[28px] tracking-[4px] text-accent text-glow'
      }
    >
      {String(seconds).padStart(2, '0')}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/test/Timer.tsx
git commit -m "feat(test): Timer component"
```

---

## Task 22: AnswerGrid, NoCorrectButton, ExplanationPanel, PenaltyOverlay, LevelUpOverlay

**Files:**
- Create: `src/components/test/AnswerGrid.tsx`, `NoCorrectButton.tsx`, `ExplanationPanel.tsx`, `PenaltyOverlay.tsx`, `LevelUpOverlay.tsx`

- [ ] **Step 1: AnswerGrid**

`src/components/test/AnswerGrid.tsx`:
```tsx
'use client';
import { useRunStore } from '@/store/useRunStore';

interface Props {
  onAnswer: (result: 'correct' | 'wrong') => void;
}

export function AnswerGrid({ onAnswer }: Props) {
  const set = useRunStore((s) => s.currentAnswerSet);
  const queue = useRunStore((s) => s.queue);
  const idx = useRunStore((s) => s.currentIndex);
  const status = useRunStore((s) => s.status);
  if (!set) return null;
  const q = queue[idx];
  if (!q) return null;

  function handle(option: string) {
    if (status !== 'running') return;
    const correct = set!.hasCorrect && option === q.correct_answer;
    onAnswer(correct ? 'correct' : 'wrong');
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {set.options.map((opt) => (
        <button
          key={opt}
          onClick={() => handle(opt)}
          disabled={status !== 'running'}
          className="p-3 border border-[color:var(--accent-color)]/25 bg-white/[0.02] text-text font-mono text-sm text-left hover:border-accent hover:shadow-[inset_0_0_10px_var(--accent-dim)] disabled:opacity-50"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: NoCorrectButton**

`src/components/test/NoCorrectButton.tsx`:
```tsx
'use client';
import { NeonButton } from '@/components/ui/NeonButton';
import { useRunStore } from '@/store/useRunStore';

interface Props {
  onAnswer: (result: 'bonus' | 'wrong') => void;
}

export function NoCorrectButton({ onAnswer }: Props) {
  const set = useRunStore((s) => s.currentAnswerSet);
  const status = useRunStore((s) => s.status);
  if (!set) return null;
  function handle() {
    if (status !== 'running') return;
    onAnswer(!set!.hasCorrect ? 'bonus' : 'wrong');
  }
  return (
    <NeonButton
      variant="dashed-danger"
      size="md"
      className="w-full mt-2.5"
      onClick={handle}
      disabled={status !== 'running'}
    >
      ⚠ ВІРНОЇ ВІДПОВІДІ НЕМАЄ
    </NeonButton>
  );
}
```

- [ ] **Step 3: ExplanationPanel**

`src/components/test/ExplanationPanel.tsx`:
```tsx
'use client';
import { NeonButton } from '@/components/ui/NeonButton';
import { useRunStore } from '@/store/useRunStore';

export function ExplanationPanel() {
  const queue = useRunStore((s) => s.queue);
  const idx = useRunStore((s) => s.currentIndex);
  const status = useRunStore((s) => s.status);
  const advance = useRunStore((s) => s.advance);
  const q = queue[idx];
  if (status !== 'explaining' || !q) return null;
  return (
    <div className="mt-4 border border-accent bg-[rgba(0,255,133,0.04)] p-4">
      <div className="text-[10px] tracking-widest text-muted uppercase mb-1">EXPLANATION</div>
      <div className="text-sm text-text mb-2">
        <strong className="text-accent">{q.correct_answer}</strong> — {q.explanation}
      </div>
      <NeonButton onClick={advance}>◢ NEXT</NeonButton>
    </div>
  );
}
```

- [ ] **Step 4: PenaltyOverlay**

`src/components/test/PenaltyOverlay.tsx`:
```tsx
'use client';
import { useEffect } from 'react';
import { useRunStore } from '@/store/useRunStore';

const LOCKOUT_MS = 3000;

export function PenaltyOverlay() {
  const status = useRunStore((s) => s.status);

  useEffect(() => {
    if (status !== 'penalty') return;
    const id = setTimeout(() => {
      useRunStore.setState({ status: 'explaining' });
    }, LOCKOUT_MS);
    return () => clearTimeout(id);
  }, [status]);

  if (status !== 'penalty') return null;
  return (
    <div className="fixed inset-0 z-40 backdrop-blur-sm bg-black/70 flex flex-col items-center justify-center">
      <div className="text-5xl tracking-[8px] font-bold text-danger [text-shadow:0_0_20px_#FF005C] animate-pulse">
        PENALTY
      </div>
      <div className="text-danger text-xs tracking-[3px] mt-2">-1 XP · 3 SEC LOCKOUT</div>
    </div>
  );
}
```

- [ ] **Step 5: LevelUpOverlay**

`src/components/test/LevelUpOverlay.tsx`:
```tsx
'use client';
import Link from 'next/link';
import { NeonButton } from '@/components/ui/NeonButton';

interface Props {
  previousLevel: number;
  newLevel: number;
  skillName: string;
  correct: number;
  wrong: number;
  bonus: number;
  accuracy: number;
}

export function LevelUpOverlay({ previousLevel, newLevel, skillName, correct, wrong, bonus, accuracy }: Props) {
  return (
    <div className="fixed inset-0 z-40 backdrop-blur-sm bg-black/70 flex flex-col items-center justify-center font-mono">
      <div className="text-[10px] tracking-widest text-accent">[ NOTIFICATION ]</div>
      <div className="text-4xl tracking-[6px] font-bold text-accent [text-shadow:0_0_20px_var(--accent-color)] mt-2">
        LEVEL UP
      </div>
      <div className="text-accent text-[11px] tracking-[3px] mt-2">
        Lv. {previousLevel} → Lv. {newLevel} · {skillName}
      </div>
      <div className="text-muted text-[11px] tracking-[2px] mt-5">
        CORRECT: {correct} · WRONG: {wrong} · BONUS: {bonus} · ACCURACY: {Math.round(accuracy * 100)}%
      </div>
      <Link href="/dashboard">
        <NeonButton size="lg" className="mt-5">◢ RETURN</NeonButton>
      </Link>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/test/
git commit -m "feat(test): answer grid, no-correct button, explanation, penalty/level-up overlays"
```

---

## Task 23: TestRunner glue component

**Files:**
- Create: `src/components/test/TestRunner.tsx`

- [ ] **Step 1: Implement runner**

`src/components/test/TestRunner.tsx`:
```tsx
'use client';
import { useEffect, useState } from 'react';
import { useRunStore } from '@/store/useRunStore';
import { loadSkill, type SkillId } from '@/lib/skills-loader';
import { NeonCard } from '@/components/ui/NeonCard';
import { HexBadge } from '@/components/ui/HexBadge';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { Timer } from './Timer';
import { AnswerGrid } from './AnswerGrid';
import { NoCorrectButton } from './NoCorrectButton';
import { ExplanationPanel } from './ExplanationPanel';
import { PenaltyOverlay } from './PenaltyOverlay';
import { LevelUpOverlay } from './LevelUpOverlay';
import type { Difficulty } from '@/types/run';

interface FinishedState {
  previousLevel: number;
  newLevel: number;
  skillName: string;
  correct: number;
  wrong: number;
  bonus: number;
  accuracy: number;
}

export function TestRunner({ skillId, mode }: { skillId: SkillId; mode: Difficulty }) {
  const state = useRunStore();
  const [skillName, setSkillName] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState<FinishedState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // hydrate or start
    loadSkill(skillId).then((skill) => {
      setSkillName(skill.skill_name);
      setDifficulty(skill.difficulty);
      const already = state.skillId === skillId && state.status !== 'idle' && state.status !== 'finished';
      if (!already) {
        state.startRun({ skillId, difficulty: mode, questions: skill.questions });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillId, mode]);

  useEffect(() => {
    if (state.status !== 'finished' || submitting || finished) return;
    setSubmitting(true);
    (async () => {
      try {
        const res = await fetch('/api/runs', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            skillId: state.skillId,
            difficulty: state.difficulty,
            startedAt: state.startedAt,
            finishedAt: new Date().toISOString(),
            answers: state.answers,
          }),
        });
        const data = await res.json();
        if (!data.ok) {
          setError(data.error ?? 'Submit failed');
          return;
        }
        setFinished({
          previousLevel: data.previousLevel,
          newLevel: data.newLevel,
          skillName,
          correct: state.correctCount,
          wrong: state.wrongCount,
          bonus: state.bonusCount,
          accuracy: data.run.stats.accuracy,
        });
        state.reset();
      } catch (e) {
        // save to pending
        const pending = JSON.parse(localStorage.getItem('pendingRuns') ?? '[]');
        pending.push({
          skillId: state.skillId,
          difficulty: state.difficulty,
          startedAt: state.startedAt,
          finishedAt: new Date().toISOString(),
          answers: state.answers,
        });
        localStorage.setItem('pendingRuns', JSON.stringify(pending));
        setError('Мережа недоступна. Результат збережено локально.');
      } finally {
        setSubmitting(false);
      }
    })();
  }, [state.status, submitting, finished, state, skillName]);

  const progressDots = state.queue.map((_, i) => {
    if (i < state.currentIndex) {
      const ans = state.answers[i];
      if (!ans) return 'pending' as const;
      return ans.result === 'correct' || ans.result === 'bonus' ? 'done' : 'wrong';
    }
    if (i === state.currentIndex) return 'cur' as const;
    return 'pending' as const;
  });

  if (finished) {
    return (
      <>
        {finished.newLevel > finished.previousLevel ? (
          <LevelUpOverlay {...finished} />
        ) : (
          <NeonCard className="text-center">
            <div className="text-[10px] tracking-widest text-muted uppercase">[ RUN COMPLETE ]</div>
            <div className="text-2xl tracking-widest text-accent text-glow mt-2">{skillName}</div>
            <div className="mt-4 text-muted text-[11px] tracking-[2px]">
              CORRECT: {finished.correct} · WRONG: {finished.wrong} · BONUS: {finished.bonus} · ACCURACY:{' '}
              {Math.round(finished.accuracy * 100)}%
            </div>
            <a href="/dashboard" className="text-accent mt-6 inline-block">◢ RETURN</a>
          </NeonCard>
        )}
      </>
    );
  }

  const q = state.queue[state.currentIndex];
  if (!q) return <div className="text-muted">Loading...</div>;

  return (
    <NeonCard>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-3 items-center">
          <HexBadge rank={difficulty} />
          <div>
            <div className="text-[10px] tracking-widest text-muted uppercase">{skillName} · {state.difficulty}</div>
            <div className="text-accent text-glow">{state.currentIndex + 1} / {state.queue.length}</div>
          </div>
        </div>
        <Timer />
      </div>
      <ProgressDots results={progressDots} />
      <div className="p-3.5 border-l-2 border-accent bg-[rgba(0,255,133,0.03)] mb-4">{q.question}</div>
      <AnswerGrid onAnswer={(r) => state.registerAnswer(r)} />
      <NoCorrectButton onAnswer={(r) => state.registerAnswer(r)} />
      <ExplanationPanel />
      <PenaltyOverlay />
      {error && <div className="text-danger text-xs mt-3">{error}</div>}
    </NeonCard>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/test/TestRunner.tsx
git commit -m "feat(test): TestRunner glue component"
```

---

## Task 24: Test page

**Files:**
- Create: `src/app/(app)/test/[skillId]/page.tsx`

- [ ] **Step 1: Implement**

```tsx
'use client';
import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { TestRunner } from '@/components/test/TestRunner';
import type { Difficulty } from '@/types/run';
import { SKILL_IDS, type SkillId } from '@/data/skills-manifest';

export default function TestPage({ params }: { params: Promise<{ skillId: string }> }) {
  const { skillId } = use(params);
  const search = useSearchParams();
  const mode = (search.get('mode') === 'hardcore' ? 'hardcore' : 'normal') as Difficulty;

  if (!(SKILL_IDS as readonly string[]).includes(skillId)) {
    return (
      <div className="text-center mt-20">
        <div className="text-danger text-4xl tracking-widest text-glow">SIGNAL LOST</div>
        <div className="text-muted text-xs tracking-widest mt-2">Unknown skill id: {skillId}</div>
        <a className="text-accent mt-6 inline-block" href="/dashboard">◢ RETURN TO DASHBOARD</a>
      </div>
    );
  }

  return <TestRunner skillId={skillId as SkillId} mode={mode} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(app\)/test/
git commit -m "feat(app): /test/[skillId] page"
```

---

## Task 25: /api/runs with integration test

**Files:**
- Create: `src/app/api/runs/route.ts`, `tests/integration/runs-api.test.ts`

- [ ] **Step 1: Write failing integration test**

`tests/integration/runs-api.test.ts`:
```ts
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, ObjectId } from 'mongodb';

let mongod: MongoMemoryServer;
let client: MongoClient;
const USER_ID = new ObjectId();

// Mock `auth()` to return a session for USER_ID
vi.mock('@/lib/auth', async () => ({
  auth: async () => ({ user: { id: USER_ID.toString(), email: 't@t.t' } }),
}));

import { vi } from 'vitest';

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
});

afterAll(async () => {
  await client.close();
  await mongod.stop();
});

beforeEach(async () => {
  const db = client.db('shadow-leveling');
  await db.collection('runs').deleteMany({});
  await db.collection('progress').deleteMany({});
});

function makeBody(overrides: Partial<{ skillId: string; answers: Array<{ questionId: string; result: string }> }> = {}) {
  return {
    skillId: 'js-basics',
    difficulty: 'normal',
    startedAt: new Date(Date.now() - 60_000).toISOString(),
    finishedAt: new Date().toISOString(),
    answers: [
      { questionId: 'q1', result: 'correct' },
      { questionId: 'q2', result: 'correct' },
      { questionId: 'q3', result: 'wrong' },
    ],
    ...overrides,
  };
}

describe('POST /api/runs', () => {
  it('calculates xpDelta and creates progress row', async () => {
    const { POST } = await import('@/app/api/runs/route');
    const res = await POST(
      new Request('http://x/api/runs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(makeBody()),
      }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.run.stats.xpDelta).toBe(1); // 2 correct + 1 wrong = +2 -1 = +1
    expect(data.run.stats.accuracy).toBeCloseTo(2 / 3);
    expect(data.newLevel).toBe(1);
    expect(data.leveledUp).toBe(false);
    const db = client.db('shadow-leveling');
    const progress = await db.collection('progress').findOne({ userId: USER_ID, skillId: 'js-basics' });
    expect(progress?.totalXP).toBe(1);
  });

  it('detects level up', async () => {
    const db = client.db('shadow-leveling');
    await db.collection('progress').insertOne({
      userId: USER_ID,
      skillId: 'js-basics',
      totalXP: 9,
      level: 1,
      bestStreak: 0,
      lastRunAccuracy: 0,
      lastRunAt: null,
      updatedAt: new Date(),
    });
    const { POST } = await import('@/app/api/runs/route');
    const body = makeBody({
      answers: [
        { questionId: 'q1', result: 'correct' },
        { questionId: 'q2', result: 'correct' },
      ],
    });
    const res = await POST(
      new Request('http://x/api/runs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }),
    );
    const data = await res.json();
    expect(data.leveledUp).toBe(true);
    expect(data.previousLevel).toBe(1);
    expect(data.newLevel).toBe(2);
  });

  it('clamps totalXP at 0 when losing more than earned', async () => {
    const { POST } = await import('@/app/api/runs/route');
    const body = makeBody({
      answers: [
        { questionId: 'q1', result: 'wrong' },
        { questionId: 'q2', result: 'wrong' },
      ],
    });
    const res = await POST(
      new Request('http://x/api/runs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }),
    );
    const data = await res.json();
    expect(data.newLevel).toBe(1);
    const db = client.db('shadow-leveling');
    const progress = await db.collection('progress').findOne({ userId: USER_ID, skillId: 'js-basics' });
    expect(progress?.totalXP).toBe(0);
  });
});
```

- [ ] **Step 2: Implement route**

`src/app/api/runs/route.ts`:
```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongo';
import { clampXP, levelFromXP, xpScoring } from '@/lib/level';

const bodySchema = z.object({
  skillId: z.string().min(1),
  difficulty: z.enum(['normal', 'hardcore']),
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime(),
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        result: z.enum(['correct', 'wrong', 'bonus', 'timeout']),
      }),
    )
    .min(1),
});

function calcDelta(result: 'correct' | 'wrong' | 'bonus' | 'timeout'): number {
  if (result === 'correct') return xpScoring.correct;
  if (result === 'bonus') return xpScoring.bonusNoCorrect;
  return xpScoring.wrong;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: 'Unauthorized', code: 'unauthorized' }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'invalid input', code: 'invalid_input' },
      { status: 400 },
    );
  }
  const input = parsed.data;
  const userId = new ObjectId(session.user.id);

  let correct = 0,
    wrong = 0,
    bonus = 0,
    xpDelta = 0;
  for (const a of input.answers) {
    xpDelta += calcDelta(a.result);
    if (a.result === 'correct') correct++;
    else if (a.result === 'bonus') bonus++;
    else wrong++;
  }
  const total = input.answers.length;
  const accuracy = (correct + bonus) / total;

  const db = await getDb();
  const existing = await db.collection('progress').findOne({ userId, skillId: input.skillId });
  const prevXP = existing?.totalXP ?? 0;
  const prevLevel = existing ? levelFromXP(prevXP) : 1;
  const newXP = clampXP(prevXP + xpDelta);
  const newLevel = levelFromXP(newXP);
  const leveledUp = newLevel > prevLevel;

  const runDoc = {
    userId,
    skillId: input.skillId,
    difficulty: input.difficulty,
    startedAt: new Date(input.startedAt),
    finishedAt: new Date(input.finishedAt),
    stats: { correct, wrong, bonus, xpDelta, totalQuestions: total, accuracy },
    leveledUp,
  };
  const insertResult = await db.collection('runs').insertOne(runDoc);

  await db.collection('progress').updateOne(
    { userId, skillId: input.skillId },
    {
      $set: {
        totalXP: newXP,
        level: newLevel,
        lastRunAccuracy: accuracy,
        lastRunAt: new Date(),
        updatedAt: new Date(),
      },
      $setOnInsert: { userId, skillId: input.skillId, bestStreak: 0 },
    },
    { upsert: true },
  );

  return NextResponse.json({
    ok: true,
    run: { _id: insertResult.insertedId.toString(), ...runDoc, userId: userId.toString() },
    previousLevel: prevLevel,
    newLevel,
    leveledUp,
  });
}
```

- [ ] **Step 3: Run tests**

Run: `npm test tests/integration/runs-api.test.ts`
Expected: 3 tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/runs/route.ts tests/integration/runs-api.test.ts
git commit -m "feat(api): POST /api/runs with XP/level calc + integration tests"
```

---

## Task 26: Playwright E2E smoke test

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Playwright config**

`playwright.config.ts`:
```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
```

- [ ] **Step 2: Install browsers**

Run: `npx playwright install --with-deps chromium`

- [ ] **Step 3: Smoke test**

`tests/e2e/smoke.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test('register → login → dashboard renders skills', async ({ page }) => {
  const email = `t_${Date.now()}@example.com`;
  await page.goto('/register');
  await page.fill('input[type=email]', email);
  await page.fill('input[type=password]', 'longenough');
  await page.click('button[type=submit]');
  await page.waitForURL('/dashboard', { timeout: 15_000 });
  await expect(page.getByText('REACT HOOKS')).toBeVisible();
  await expect(page.getByText('JAVASCRIPT FUNDAMENTALS')).toBeVisible();
});
```

- [ ] **Step 4: Note — this test requires a real MongoDB**

Add to README the instruction: set `MONGODB_URI` to a test-scoped Atlas DB before running E2E locally.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts tests/e2e/
git commit -m "test(e2e): smoke — register + dashboard renders"
```

---

## Task 27: CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Workflow file**

`.github/workflows/ci.yml`:
```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run validate:skills
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test
      - run: npm run build
        env:
          MONGODB_URI: mongodb://localhost:27017/shadow-leveling
          AUTH_SECRET: ci-secret-placeholder
          AUTH_URL: http://localhost:3000
```

- [ ] **Step 2: Commit**

```bash
git add .github/
git commit -m "ci: validate + typecheck + lint + test + build"
```

---

## Task 28: README + deploy instructions

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Write README**

`README.md`:
````markdown
# Shadow Leveling

Solo Leveling-themed skill testing app.

## Dev setup

1. `cp .env.example .env.local` and fill `MONGODB_URI`, `AUTH_SECRET` (generate: `openssl rand -base64 32`).
2. `npm install`
3. `npm run validate:skills` — sanity-check data.
4. `npm run dev`

## Tests

- `npm test` — unit + integration (uses in-memory Mongo).
- `npm run test:e2e` — Playwright (needs real `MONGODB_URI`).

## Deploy (Vercel)

1. Import the repo at vercel.com.
2. Add env vars in Vercel project: `MONGODB_URI`, `AUTH_SECRET`, `AUTH_URL` (your deploy URL).
3. Vercel auto-builds on push to `main`.

## Adding skills

1. Add `src/data/skills/<id>.json` with ≥ 11 `fake_answers` per question.
2. Add `<id>` to `src/data/skills-manifest.ts` + metadata in `src/lib/skills-loader.ts`.
3. Copy JSON to `public/skills/<id>.json`.
4. `npm run validate:skills`.
````

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: setup + deploy + contribution notes"
```

---

## Self-Review Notes

**Spec coverage check:**
- [x] Section 2 (stack) — Task 1
- [x] Section 3.1 (collections + indexes) — Task 10 (`ensureIndexes`) + Tasks 11/17/25 (write paths)
- [x] Section 3.2 (Skill JSON validator) — Task 7
- [x] Section 3.3 (8 skills) — Task 7 + Task 8 manifest
- [x] Section 4 (architecture) — Tasks 1, 10, 11, 12, 13
- [x] Section 5 (project structure) — matches Tasks 1-24
- [x] Section 6.1 (XP/level) — Task 5
- [x] Section 6.2 (randomization + hasCorrect in store) — Tasks 6, 20
- [x] Section 6.3 (run flow) — Tasks 20-25
- [x] Section 6.4 (mid-run refresh, sessionStorage) — Task 20 `persist`
- [x] Section 6.5 (theme engine) — Tasks 9, 13
- [x] Section 7 (auth, lazy progress init) — Tasks 11, 12, 16, 17, 25 (`upsert` with `$setOnInsert`)
- [x] Section 8 (UI dashboard/test/overlays/login) — Tasks 13-24
- [x] Section 8.1 (icons stub) — Task 15
- [x] Section 9 (API contracts) — Tasks 11, 17, 25
- [x] Section 10 (error handling, unknown skillId 404, pending runs, dup validation) — Tasks 7, 23, 24
- [x] Section 11 (tests: level, shuffle, randomize, runs, register, E2E) — Tasks 4, 5, 6, 11, 25, 26
- [x] Section 12 (timeline) — reflected in task ordering
- [x] Section 13 (known limits — client randomization, 7-day scope) — documented in spec, acknowledged in plan
- [x] Section 14 (future work) — icon stubs ready (Task 15)

**Placeholder check:** no TBD/TODO in code. Dashboard lazy-init is handled by `upsert` with `$setOnInsert` in Task 25.

**Consistency check:** `DashboardProgress` fields (`xpForCurrentLevel`, `xpForNextLevel`) match between Task 3 type, Task 17 API, Task 18 SkillCard, Task 19 dashboard. `AnswerResult` enum consistent across Tasks 3, 20, 25.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-25-shadow-leveling.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
