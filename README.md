# Shadow Leveling

Solo Leveling-themed skill testing app. Built with Next.js 15 + MongoDB Atlas + NextAuth v5.

## Dev setup

1. `cp .env.example .env.local` and fill:
   - `MONGODB_URI` — MongoDB Atlas connection string
   - `AUTH_SECRET` — generate with `openssl rand -base64 32`
   - `AUTH_URL` — `http://localhost:3000` for dev
2. `npm install`
3. `npm run validate:skills` — sanity-check skill JSON files
4. `npm run dev`

Open http://localhost:3000 and register a new account.

## Tests

- `npm test` — unit + integration (uses in-memory Mongo via `mongodb-memory-server`)
- `npm run test:e2e` — Playwright smoke (needs real `MONGODB_URI` + `AUTH_SECRET` and dev server)
- `npm run typecheck` — TypeScript strict mode
- `npm run lint` — ESLint

## Deploy (Vercel)

1. Import the repo at vercel.com.
2. Add env vars in Vercel project settings:
   - `MONGODB_URI` (production Mongo Atlas URL)
   - `AUTH_SECRET`
   - `AUTH_URL` — your Vercel deploy URL (e.g., `https://your-app.vercel.app`)
3. Vercel auto-builds on push to `main`.

**Note on middleware edge runtime:** Next.js middleware runs on Edge. Current `/src/lib/auth.ts` uses `bcryptjs` + `mongodb`, which aren't Edge-compatible. Before production deploy, split the auth config into an edge-safe layer (JWT verification only) for middleware and keep the full config (providers + DB) for route handlers. See [NextAuth v5 split config guide](https://authjs.dev/guides/edge-compatibility).

## Adding skills

1. Add `src/data/skills/<id>.json` with:
   - `skill_id` matching filename
   - `skill_name`, `difficulty` (one of: E/D/C/B/A/S-Rank)
   - `questions[]` where each has `id`, `question`, `correct_answer`, `explanation`, `fake_answers` (minimum 11)
2. Add `<id>` to `src/data/skills-manifest.ts` and metadata (skill_name, difficulty) in `src/lib/skills-loader.ts` → `getSkillMetadata()`
3. Copy the JSON to `public/skills/<id>.json` so the client can fetch it
4. Run `npm run validate:skills`

## Project structure

- `/src/app` — Next.js App Router (auth/app routes + API)
- `/src/components/{ui,dashboard,test}` — React components
- `/src/lib` — shuffle, level, randomize, theme, auth, mongo
- `/src/store/useRunStore.ts` — Zustand run state with sessionStorage persistence
- `/src/data/skills/*.json` — skill test data
- `/public/skills/*.json` — copies served to client
- `/public/bg/*` — per-day backgrounds
- `/tests/{unit,integration,e2e}` — Vitest + Playwright tests

## Specs & plans

- `docs/superpowers/specs/2026-04-25-shadow-leveling-design.md` — full design spec
- `docs/superpowers/plans/2026-04-25-shadow-leveling.md` — implementation plan
