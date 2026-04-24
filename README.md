# Shadow Leveling

A skill-leveling test platform built on Next.js 15, TypeScript, and Tailwind CSS.

## Stack

- **Framework:** Next.js 15 (App Router) + React 19
- **Language:** TypeScript 5.7 (strict)
- **Styling:** Tailwind CSS 3.4
- **Auth:** NextAuth v5 (beta)
- **Database:** MongoDB
- **State:** Zustand
- **Validation:** Zod
- **Testing:** Vitest + happy-dom, Playwright (E2E)

## Getting Started

```bash
# Install dependencies
npm install

# Copy env template and fill in values
cp .env.example .env.local

# Run dev server
npm run dev
```

Open <http://localhost:3000>.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Run production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Run unit tests once |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:e2e` | Playwright E2E suite |
| `npm run validate:skills` | Validate skill JSON files |

## Environment Variables

See `.env.example`. Required:

- `MONGODB_URI` - MongoDB connection string
- `AUTH_SECRET` - generate with `openssl rand -base64 32`
- `AUTH_URL` - base URL of the deployment (e.g. `http://localhost:3000`)

## Project Layout

Detailed design lives in `DESIGN.md` and `docs/superpowers/specs/`.
