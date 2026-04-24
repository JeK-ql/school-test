# Shadow Leveling — Design Spec

**Date:** 2026-04-25
**Status:** Draft (awaiting user review)
**Source plan:** `/Plan.md`

## 1. Product Summary

Веб-застосунок для тренування технічних скілів у вигляді тестів з геймифікацією у стилі інтерфейсу системи манги Solo Leveling. Користувач реєструється, проходить забіги по скілах (React Hooks, JS, TS, CSS, Algorithms, SQL, Git, System Design), отримує XP / рівні, бачить прогрес. Тема інтерфейсу (неоновий акцентний колір + бекграунд) змінюється залежно від дня тижня.

**Deadline:** 7 днів. Повний обсяг Plan.md без MVP-скорочень.

## 2. Stack

| Шар | Вибір | Причина |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR, Vercel-деплой, API routes в одному репо |
| Auth | NextAuth.js v5 (Credentials) | Email/Password, bcrypt, офіційний MongoDB-адаптер |
| БД | MongoDB Atlas (free tier) | Вибір користувача, замість Supabase |
| БД-драйвер | `mongodb` (official) | Легший за Mongoose, на 3 колекціях Mongoose зайвий |
| Стилізація | Tailwind CSS | Швидке прототипування неонових ефектів |
| Стан | Zustand | Легка бібліотека для стану забігу |
| Валідація | Zod | Перевірка JSON-скілів та API-пейлоадів |
| Тести | Vitest + Playwright + mongodb-memory-server | Unit/integration/E2E |
| Хостинг | Vercel | Деплой за замовчуванням |

## 3. Data Model

### 3.1 MongoDB Collections

```ts
// users
{
  _id: ObjectId,
  email: string,              // unique index
  passwordHash: string,       // bcrypt cost 12
  createdAt: Date
}

// progress
{
  _id: ObjectId,
  userId: ObjectId,
  skillId: string,
  totalXP: number,            // >= 0
  level: number,              // computed from totalXP
  bestStreak: number,
  lastRunAccuracy: number,    // 0..1
  lastRunAt: Date | null,
  updatedAt: Date
  // compound unique: (userId, skillId)
}

// runs
{
  _id: ObjectId,
  userId: ObjectId,
  skillId: string,
  difficulty: 'normal' | 'hardcore',
  startedAt: Date,
  finishedAt: Date,
  stats: {
    correct: number,
    wrong: number,
    bonus: number,            // правильно виявлені "no correct answer"
    xpDelta: number,
    totalQuestions: number,
    accuracy: number          // correct / totalQuestions, 0..1
  },
  leveledUp: boolean
  // index: (userId, skillId, finishedAt desc)
}
```

### 3.2 Skill JSON (existing format)

Локальні файли в `/src/data/skills/{skillId}.json` (перенос із `/question/`):

```json
{
  "skill_id": "react-hooks",
  "skill_name": "React Hooks & Logic",
  "difficulty": "B-Rank",
  "questions": [
    {
      "id": "rh-001",
      "question": "...",
      "correct_answer": "useRef",
      "explanation": "...",
      "fake_answers": ["useState", "useMemo", "..."]  // мінімум 11
    }
  ]
}
```

**Валідація при білді:** `npm run validate:skills` (Zod) — перевіряє унікальність `question.id`, мінімум 11 fake_answers, відсутність дублікатів у fake+correct.

### 3.3 Starting Skills (8 штук)

1. `js-basics` (C-Rank)
2. `react-hooks` (B-Rank) — існує в `/question/example.json`
3. `typescript` (B-Rank)
4. `css-layout` (C-Rank)
5. `algorithms` (A-Rank)
6. `sql` (B-Rank)
7. `git` (C-Rank)
8. `system-design` (S-Rank)

Стартові файли створено в `/question/` з 1-2 зразковими питаннями кожен; користувач доповнює вручну.

## 4. Architecture

```
[ Browser ]
    │
    ▼
[ Next.js 15 App Router — single deploy on Vercel ]
    ├─ Server Components
    │   • /(app)/dashboard — читає agg прогрес із Mongo
    │   • /(app)/test/[skillId] — shell з auth-check
    ├─ Client Components
    │   • TestRunner, Timer, ThemeProvider, Overlays
    ├─ API Routes
    │   /api/auth/[...nextauth]  — NextAuth (jwt session strategy)
    │   /api/auth/register       — POST { email, password }
    │   /api/runs                — POST run-результат, оновлює progress
    │   /api/progress            — GET aggregated для Dashboard
    ├─ Middleware
    │   /src/middleware.ts — редірект на /login з /(app)/*
    └─ Static data
        • /src/data/skills/*.json — клієнт тягне через fetch
        • /src/data/icons-registry.json — метадані іконок
```

## 5. Project Structure

```
/src
  /app
    /(auth)
      /login/page.tsx
      /register/page.tsx
    /(app)
      /dashboard/page.tsx            Server Component
      /test/[skillId]/page.tsx       Client-side runner shell
      layout.tsx                     ThemeProvider + navbar
    /api
      /auth/[...nextauth]/route.ts
      /auth/register/route.ts
      /runs/route.ts                 POST
      /progress/route.ts             GET
    layout.tsx                       root
    globals.css                      CSS variables + neon utilities
  /components
    /ui
      NeonButton.tsx
      NeonCard.tsx
      HexBadge.tsx                   шестикутник з рангом
      ProgressBar.tsx
      SystemModal.tsx
      Icon.tsx                       читає icons-registry.json
      ProgressDots.tsx
    /dashboard
      SkillCard.tsx                  варіант C з hex-бейджем + "Enter Dungeon"
      DifficultyModal.tsx
    /test
      TestRunner.tsx
      Timer.tsx
      AnswerGrid.tsx
      NoCorrectButton.tsx
      PenaltyOverlay.tsx
      LevelUpOverlay.tsx
      ExplanationPanel.tsx
  /data
    /skills/*.json                   8 файлів
    icons-registry.json
  /lib
    mongo.ts                         cached connection
    auth.ts                          NextAuth config
    level.ts                         XP → Level formulas
    shuffle.ts                       Fisher-Yates
    theme.ts                         daily themes map
    randomize.ts                     логіка вибору 3 фейкових + no-correct case
    validate-skills.ts               Zod schemas
  /store
    useRunStore.ts                   Zustand + sessionStorage persist
  /types
    skill.ts, run.ts, progress.ts, user.ts
  /middleware.ts
/scripts
  validate-skills.ts                 npm run validate:skills
  seed-local.ts                      optional: локальний Mongo seed
/public
  /bg/{mon,tue,wed,thu,fri,sat,sun}.webp   (на старті: SVG gradients)
  /icons/*.svg                       (поки порожньо, замінить stub-рендер)
```

## 6. Core Logic

### 6.1 XP / Level formula (`/src/lib/level.ts`)

```ts
// quadratic curve
export const xpRequiredForLevel = (n: number) => n * (n - 1) * 5;
// Lv 2 = 10, Lv 3 = 30, Lv 4 = 60, Lv 5 = 100, Lv 10 = 450

export const levelFromXP = (totalXP: number) => {
  // найбільше n, для якого xpRequiredForLevel(n) <= totalXP
  // floor(1 + sqrt(1 + 4*totalXP/5)) / 2 — closed form
  return Math.floor((1 + Math.sqrt(1 + (4 * totalXP) / 5)) / 2);
};

export const xpScoring = {
  correct: +1,
  wrong: -1,
  bonusNoCorrect: +2
};
```

`totalXP` не може бути < 0 (clamp на сервері).

### 6.2 Randomization (`/src/lib/randomize.ts`)

```ts
const NO_CORRECT_PROBABILITY = 0.18; // всередині діапазону 15-20%

function generateAnswerSet(question: Question): {
  options: string[],
  hasCorrect: boolean
} {
  const hasCorrect = Math.random() > NO_CORRECT_PROBABILITY;
  const fakes = pickRandom(question.fake_answers, hasCorrect ? 3 : 4);
  const options = shuffle(
    hasCorrect ? [...fakes, question.correct_answer] : fakes
  );
  return { options, hasCorrect };
}
```

`hasCorrect` зберігається **у Zustand store**, не передається через DOM data-атрибути.

### 6.3 Run flow (TestRunner)

1. Mount: fetch `/src/data/skills/{skillId}.json` → shuffle questions → `queue`.
2. Для кожного `q`:
   - `generateAnswerSet(q)` → 4 кнопки + "No correct" button.
   - Таймер: 30с (normal) / 10с (hardcore), тік 1с.
3. Обробка:
   - Правильна обрана → +1 XP, показ `explanation`.
   - "No correct" + `hasCorrect === false` → +2 XP (bonus), показ `explanation`.
   - Помилка / таймаут → -1 XP, **PenaltyOverlay 3 сек** (блокування UI, неоновий "PENALTY -1 XP"), потім `explanation`.
4. Після останнього питання → POST `/api/runs` з `{ skillId, difficulty, startedAt, finishedAt, answers: [{questionId, correct, noCorrectCase, bonus}] }`.
5. Сервер у `/api/runs`:
   - Обчислює `xpDelta`, `accuracy`, новий `totalXP`, новий `level`.
   - Якщо `level > progress.level` → `leveledUp: true`.
   - Insert у `runs`, upsert у `progress`.
   - Відповідь: `{ run, leveledUp, newLevel, newXP, newProgress }`.
6. Клієнт: якщо `leveledUp` → LevelUpOverlay, потім redirect на `/dashboard`.

### 6.4 Mid-run refresh

`useRunStore` з Zustand `persist` middleware → `sessionStorage`. При refresh відновлюється `queue`, `currentIndex`, `scores`, `remainingMs`, `pausedAt`. Перед unmount/visibility-change — зберігається `pausedAt = Date.now()` і `remainingMs`. При повторному mount — таймер стартує з того ж `remainingMs` (не додаємо час "простою").

### 6.5 Theme Engine (`/src/lib/theme.ts`)

```ts
export const dailyThemes = {
  0: { accent: '#4F4F4F', label: 'Rest',     bg: '/bg/sun.webp' },
  1: { accent: '#00F2FF', label: 'Energy',   bg: '/bg/mon.webp' },
  2: { accent: '#00FF85', label: 'Growth',   bg: '/bg/tue.webp' },
  3: { accent: '#FFD600', label: 'Focus',    bg: '/bg/wed.webp' },
  4: { accent: '#FF7A00', label: 'Pressure', bg: '/bg/thu.webp' },
  5: { accent: '#FF005C', label: 'Finish',   bg: '/bg/fri.webp' },
  6: { accent: '#BD00FF', label: 'Magic',    bg: '/bg/sat.webp' },
};
```

`ThemeProvider` (Client Component) у root layout: встановлює CSS variable `--accent-color` + фонове зображення на `<body>` при маунті, реагує на зміну дня (новий день → новий акцент без рефрешу).

На старті `/public/bg/*.webp` замінити генерованими SVG-градієнтами щоб не блокувати на пошуку артів.

## 7. Authentication

- **Strategy:** NextAuth.js v5, `session: { strategy: 'jwt' }` — без сесій в БД (простіше).
- **Provider:** CredentialsProvider (email + password).
- **Реєстрація:** окремий `POST /api/auth/register` (bcrypt cost 12, insert у `users`). **Рядки `progress` створюються ліниво** — upsert у `/api/runs` при першому забігу по скілу; це спрощує додавання нових скілів без міграцій. Dashboard запит `/api/progress` left-join'ить список скілів з Mongo, відсутні — віддає з `totalXP: 0, level: 1`.
- **Вхід:** `signIn('credentials', { email, password })`.
- **Захист роутів:** `/src/middleware.ts` перехоплює `/(app)/*`, редіректить на `/login` якщо немає jwt.
- **Пароль:** мінімум 8 символів (Zod на клієнті + сервері).

## 8. UI Design

**Стиль:** Solo Leveling system window — темний фон (#0a0a0a), неонові акценти (колір зі дня тижня), monospace-шрифт, scanline/grid overlay, glow-ефекти.

**Затверджено:**
- **SkillCard:** варіант C — hex-бейдж рангу (B/A/S/C тощо), назва скіла, рівень, XP-прогрес-бар, CTA **"◢ Enter Dungeon"**. Click → `DifficultyModal` → redirect на `/test/[skillId]?mode=...`.
- **Test screen:** hex-бейдж + назва + складність зверху-ліворуч, великий таймер справа, прогрес-точки, питання у бордер-блоці з неоновою лінією зліва, 2×2 grid варіантів, окрема пунктирна кнопка "⚠ Вірної відповіді немає".
- **Penalty overlay:** повноекранний blur, червоний "PENALTY", під ним "-1 XP · 3 sec lockout", пульсуюча анімація.
- **Level Up overlay:** зелений "LEVEL UP", "Lv. N → Lv. N+1 · Skill Name", під ним статистика забігу, кнопка "◢ RETURN".
- **Login/Register:** мінімальний "SYSTEM ACCESS" з логотипом "SHADOW LEVELING", двома полями та неоновою кнопкою "▶ ENTER THE SYSTEM".

### 8.1 Icons

Реєстр з 20 іконок у `/src/data/icons-registry.json`:
- **Navigation (8):** winged-dagger, open-ancient-book, gate-portal, trophy-aura, stopwatch, rising-chart, settings-gear, mana-potion.
- **Gameplay (6):** sword-staff, spike-shield, glowing-key, treasure-chest, shadow-soldier, ranked-medals.
- **System (6):** lightning-bolt, question-aura, glowing-skull, magic-bell, flame, search-magnifier.

**Стартова реалізація:** `<Icon name="winged-dagger" size={24} />` рендерить SVG-заглушку (коло з перших 2 букв id, data-icon атрибут, currentColor). Tooltip = label. Підміна — додати фінальні SVG у `/public/icons/{id}.svg` і змінити `status: "ready"` у реєстрі.

Ці іконки поки **не використовуються в MVP-скрінах** (Dashboard / Test / Login дизайн затверджено без них). Вони для майбутніх фіч (профіль, досягнення, магазин, соц-функції).

## 9. API Contracts

### POST `/api/auth/register`
```
Request: { email: string, password: string }
Response 200: { ok: true, userId: string }
Response 400: { ok: false, error: 'invalid_email' | 'weak_password' | 'email_taken', code: string }
```

### POST `/api/runs` (requires auth)
```
Request: {
  skillId: string,
  difficulty: 'normal' | 'hardcore',
  startedAt: string (ISO),
  finishedAt: string (ISO),
  answers: Array<{ questionId: string, result: 'correct' | 'wrong' | 'bonus' | 'timeout' }>
}
Response 200: {
  ok: true,
  run: RunDoc,
  progress: ProgressDoc,
  leveledUp: boolean,
  previousLevel: number,
  newLevel: number
}
Response 400/401: { ok: false, error: string, code: string }
```

### GET `/api/progress` (requires auth)
```
Response 200: {
  ok: true,
  progress: Array<{
    skillId, skillName, difficulty, totalXP, level,
    lastRunAccuracy, lastRunAt, bestStreak,
    xpForNextLevel, xpForCurrentLevel
  }>
}
```

## 10. Error Handling

- API: всі route handlers → `{ ok: false, error, code }` з 4xx/5xx. Jerel client перевіряє `ok` перед використанням.
- Клієнтські помилки: toast у неоновому `SystemMessage` стилі.
- **Unknown skillId:** 404-сторінка "SIGNAL LOST".
- **Порожній скіл:** відфільтровується валідатором під час білду (`validate-skills` script).
- **Network fail при POST `/api/runs`:** результат run зберігається у `localStorage.pendingRuns[]`, Dashboard показує "re-sync" кнопку яка повторно POST-ить всі pending.
- **Дублікати `question.id`:** blocker на білді (Zod).

## 11. Testing

- **Unit (Vitest):**
  - `level.ts` — `levelFromXP(0)=1`, `levelFromXP(10)=2`, межі квадратичної формули, clamp при від'ємному `totalXP`.
  - `shuffle.ts` — перевірка через seed: shuffle([1..100]) з фіксованим seed даватиме той самий порядок.
  - `randomize.ts` — що завжди 4 варіанти, що `hasCorrect=false` трапляється в ~18% з 10k ітерацій.
- **Integration (Vitest + mongodb-memory-server):**
  - `POST /api/runs` — коректне обчислення xpDelta, upsert progress, level-up detection.
  - `POST /api/auth/register` — bcrypt hash, email-taken конфлікт.
- **E2E (Playwright):**
  - Smoke: register → login → dashboard → click skill → modal → start run → answer 1 question correctly → see XP update.
- **CI:** GitHub Actions — `npm run validate:skills && npm test && npm run build` на кожен push.

## 12. Timeline (7 днів)

| День | Фокус |
|---|---|
| 1 | Next.js скафолд, Tailwind, Mongo connection, NextAuth Credentials, register/login page, middleware |
| 2 | Dashboard (SkillCard C), DifficultyModal, перенос JSON у `/src/data/skills`, Zod-валідатор |
| 3 | TestRunner: shuffle, randomize, Timer, AnswerGrid, "No correct" button, sessionStorage persist |
| 4 | API `/api/runs` + `/api/progress`, рівні, PenaltyOverlay, LevelUpOverlay, pending-runs sync |
| 5 | ThemeProvider, 7 фонів (SVG-gradient на старті), scanline-efekt, неонові утиліти в globals.css |
| 6 | HexBadge, Icon stub-рендер, іконки-реєстр, polish всіх оверлеїв, tests (level.ts, randomize.ts, runs API) |
| 7 | E2E smoke, validate:skills у CI, деплой на Vercel, підключення Mongo Atlas, smoke тестування на прод |

## 13. Known Limits & Risks

- **Cheat via DevTools:** обрано клієнтську рандомізацію (варіант B у Q3), тож JSON видно в Network tab. Прийнятний компроміс на старті. Пізніше — міграція на серверну (варіант A) без зміни інтерфейсу.
- **7-day deadline:** агресивно. Іконки, звуки "Level Up", фонові арти, соц-фічі (гільдії, PvP) — **поза скоупом MVP-запуску**, заглушки в `icons-registry.json` готові для майбутньої інтеграції.
- **Vercel timeout:** `/api/runs` має робити 2 upsert'и і 1 insert — укладемося в hobby tier (10s). Моніторити.

## 14. Open Future Work (not in MVP)

Нижче — фічі, для яких заготовлені іконки, але які НЕ входять у 7-денний обсяг:

- Профіль користувача (winged-dagger)
- Зал слави / Досягнення (trophy-aura)
- Lootbox / Скриня (treasure-chest)
- Streak-механіка (flame + spike-shield)
- PvP дуелі (sword-staff)
- Гільдії (shadow-soldier)
- Бліц-квізи окремо від звичайних (stopwatch)
- Пошук по базі знань (search-magnifier)
- Магазин бонусів (mana-potion)
- Сповіщення системи (magic-bell)
- Підказки-hint (lightning-bolt)
- Бос-рівень / фінальний тест (question-aura)
- Ранкові медалі E/D/C/B/A/S (ranked-medals)
- Розблокування контенту ключем (glowing-key)

Кожна — окремий follow-up spec.
